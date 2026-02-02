import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Checklist, ChecklistData, ChecklistItemData } from './components';
import { parseMarkdown, ParsedMarkdown, ChecklistItem as ParsedChecklistItem } from './parser/markdownParser';
import { useTheme } from './ThemeContext';

// Type for task state map
type TaskStateMap = Record<string, boolean>;

// Type for file library entry
interface FileLibraryEntry {
  path: string;
  name: string;
}

// Type for app settings
interface AppSettings {
  highlightCurrentStep: boolean;
  fileLibrary: FileLibraryEntry[];
  textScale: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  highlightCurrentStep: true,
  fileLibrary: [],
  textScale: 1.0,
};

// Text scale constraints
const TEXT_SCALE_MIN = 0.8;
const TEXT_SCALE_MAX = 1.5;
const TEXT_SCALE_STEP = 0.1;

// Default empty checklist when no file is loaded
const emptyChecklist: ChecklistData = {
  title: 'Load a Markdown File',
  sections: [{
    id: 'empty-section',
    title: 'Getting Started',
    items: [{
      id: 'empty-item-1',
      text: 'Use menu bar icon → "Load Markdown File..."',
      isCompleted: false,
      isActive: false,
    }, {
      id: 'empty-item-2', 
      text: 'Or press Cmd+Shift+R to reload',
      isCompleted: false,
      isActive: false,
    }],
  }],
};

// Helper to recursively update item completion status and return new completion state
const updateItemById = (
  items: ChecklistItemData[],
  id: string,
  newCompleted?: boolean
): ChecklistItemData[] => {
  return items.map((item) => {
    if (item.id === id) {
      return { ...item, isCompleted: newCompleted ?? !item.isCompleted };
    }
    if (item.children) {
      return { ...item, children: updateItemById(item.children, id, newCompleted) };
    }
    return item;
  });
};

// Helper to apply persisted state to checklist data
const applyPersistedState = (
  data: ChecklistData,
  persistedTasks: TaskStateMap
): ChecklistData => {
  const applyToItems = (items: ChecklistItemData[]): ChecklistItemData[] => {
    return items.map((item) => ({
      ...item,
      isCompleted: persistedTasks[item.id] ?? item.isCompleted,
      children: item.children ? applyToItems(item.children) : undefined,
    }));
  };
  return {
    ...data,
    sections: data.sections.map((section) => ({
      ...section,
      items: applyToItems(section.items),
    })),
  };
};

// Helper to extract all task states from checklist data
const extractTaskStates = (data: ChecklistData): TaskStateMap => {
  const states: TaskStateMap = {};
  const collectFromItems = (items: ChecklistItemData[]) => {
    for (const item of items) {
      states[item.id] = item.isCompleted;
      if (item.children) {
        collectFromItems(item.children);
      }
    }
  };
  for (const section of data.sections) {
    collectFromItems(section.items);
  }
  return states;
};

// Helper to flatten items for navigation
const flattenItems = (data: ChecklistData): ChecklistItemData[] => {
  const result: ChecklistItemData[] = [];
  const collectItems = (items: ChecklistItemData[]) => {
    for (const item of items) {
      result.push(item);
      if (item.children) {
        collectItems(item.children);
      }
    }
  };
  for (const section of data.sections) {
    collectItems(section.items);
  }
  return result;
};

// Helper to set active state on items (respects highlightCurrentStep setting)
const setActiveItem = (data: ChecklistData, activeId: string | null, highlightEnabled: boolean): ChecklistData => {
  const updateItems = (items: ChecklistItemData[]): ChecklistItemData[] => {
    return items.map((item) => ({
      ...item,
      isActive: highlightEnabled && item.id === activeId,
      children: item.children ? updateItems(item.children) : undefined,
    }));
  };
  return {
    ...data,
    sections: data.sections.map((section) => ({
      ...section,
      items: updateItems(section.items),
    })),
  };
};

// Convert parsed markdown to ChecklistData format
const convertParsedToChecklistData = (parsed: ParsedMarkdown): ChecklistData => {
  const convertItems = (items: ParsedChecklistItem[], sectionIndex: number, prefix: string): ChecklistItemData[] => {
    return items.map((item, itemIndex) => ({
      id: `${prefix}-${itemIndex}`,
      text: item.text,
      isCompleted: item.checked,
      isActive: false,
      images: item.images,
      children: item.children ? convertItems(item.children, sectionIndex, `${prefix}-${itemIndex}`) : undefined,
    }));
  };

  return {
    title: parsed.title,
    sections: parsed.sections.map((section, sectionIndex) => ({
      id: `section-${sectionIndex}`,
      title: section.title,
      items: convertItems(section.items, sectionIndex, `section-${sectionIndex}`),
    })),
  };
};

const App: React.FC = () => {
  const { theme, themeMode, toggleTheme } = useTheme();
  const [checklistData, setChecklistData] = useState<ChecklistData>(emptyChecklist);
  const [loadedFilePath, setLoadedFilePath] = useState<string | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(-1);
  const [isStateLoaded, setIsStateLoaded] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const persistedTasksRef = useRef<TaskStateMap>({});

  // Load persisted state on app start
  useEffect(() => {
    const loadPersistedState = async () => {
      try {
        const state = await window.electronAPI?.loadState();
        if (state && state.tasks) {
          persistedTasksRef.current = state.tasks;
          setChecklistData((prev) => applyPersistedState(prev, state.tasks));
        }
        // Load settings from localStorage
        const savedSettings = localStorage.getItem('demoOverlaySettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Failed to load persisted state:', error);
      } finally {
        setIsStateLoaded(true);
      }
    };
    loadPersistedState();
  }, []);

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem('demoOverlaySettings', JSON.stringify(settings));
  }, [settings]);

  // Subscribe to file selection from menu
  useEffect(() => {
    const unsubscribe = window.electronAPI?.onFileSelected(async (filePath: string) => {
      try {
        const content = await window.electronAPI?.readFile(filePath);
        if (content) {
          const parsed = parseMarkdown(content);
          const converted = convertParsedToChecklistData(parsed);
          // Apply any persisted state for the new checklist
          const withPersistedState = applyPersistedState(converted, persistedTasksRef.current);
          setChecklistData(withPersistedState);
          setLoadedFilePath(filePath);
          setCurrentItemIndex(-1);
        }
      } catch (error) {
        console.error('Failed to load markdown file:', error);
      }
    });
    return () => {
      // Note: onFileSelected doesn't return an unsubscribe function currently
      // This is a cleanup placeholder for future implementation
    };
  }, []);

  // Update active state when currentItemIndex changes
  useEffect(() => {
    const flatItems = flattenItems(checklistData);
    const activeId = currentItemIndex >= 0 && currentItemIndex < flatItems.length
      ? flatItems[currentItemIndex].id
      : null;
    setChecklistData((prev) => setActiveItem(prev, activeId, settings.highlightCurrentStep));
  }, [currentItemIndex, settings.highlightCurrentStep]);

  // Register keyboard shortcut handlers
  useEffect(() => {
    // Handle Cmd+Shift+N - Next unchecked item
    window.electronAPI?.onNextItem(() => {
      setChecklistData((prev) => {
        const flatItems = flattenItems(prev);
        // Find next unchecked item starting from current position
        let nextIndex = currentItemIndex + 1;
        while (nextIndex < flatItems.length) {
          if (!flatItems[nextIndex].isCompleted) {
            setCurrentItemIndex(nextIndex);
            return prev;
          }
          nextIndex++;
        }
        // Wrap around to beginning
        for (let i = 0; i < currentItemIndex; i++) {
          if (!flatItems[i].isCompleted) {
            setCurrentItemIndex(i);
            return prev;
          }
        }
        return prev;
      });
    });

    // Handle Cmd+Shift+X - Complete current item
    window.electronAPI?.onCompleteItem(() => {
      setChecklistData((prev) => {
        const flatItems = flattenItems(prev);
        if (currentItemIndex >= 0 && currentItemIndex < flatItems.length) {
          const currentItem = flatItems[currentItemIndex];
          const newData = {
            ...prev,
            sections: prev.sections.map((section) => ({
              ...section,
              items: updateItemById(section.items, currentItem.id, true),
            })),
          };

          // Auto-advance to next unchecked item if highlight is enabled
          if (settings.highlightCurrentStep) {
            const newFlatItems = flattenItems(newData);
            let nextIndex = -1;
            // Find next unchecked item after current position
            for (let i = currentItemIndex + 1; i < newFlatItems.length; i++) {
              if (!newFlatItems[i].isCompleted) {
                nextIndex = i;
                break;
              }
            }
            // Wrap around if no unchecked item found after current
            if (nextIndex === -1) {
              for (let i = 0; i < currentItemIndex; i++) {
                if (!newFlatItems[i].isCompleted) {
                  nextIndex = i;
                  break;
                }
              }
            }
            setCurrentItemIndex(nextIndex);
          }

          // Persist the updated state
          const newStates = extractTaskStates(newData);
          persistedTasksRef.current = newStates;
          window.electronAPI?.saveState(newStates).catch((error) => {
            console.error('Failed to save state:', error);
          });
          return newData;
        }
        return prev;
      });
    });

    // Handle Cmd+Shift+R - Reload markdown file
    window.electronAPI?.onReload(async () => {
      if (loadedFilePath) {
        try {
          const content = await window.electronAPI?.readFile(loadedFilePath);
          if (content) {
            const parsed = parseMarkdown(content);
            const converted = convertParsedToChecklistData(parsed);
            // Apply persisted state to the reloaded checklist
            const withPersistedState = applyPersistedState(converted, persistedTasksRef.current);
            setChecklistData(withPersistedState);
            setCurrentItemIndex(-1);
          }
        } catch (error) {
          console.error('Failed to reload markdown file:', error);
        }
      }
    });
  }, [currentItemIndex, loadedFilePath, settings.highlightCurrentStep]);

  const handleToggleItem = useCallback((id: string) => {
    setChecklistData((prev) => {
      const flatItems = flattenItems(prev);
      const toggledIndex = flatItems.findIndex((item) => item.id === id);
      const toggledItem = toggledIndex !== -1 ? flatItems[toggledIndex] : null;
      const wasUnchecked = toggledItem ? !toggledItem.isCompleted : false;

      const newData = {
        ...prev,
        sections: prev.sections.map((section) => ({
          ...section,
          items: updateItemById(section.items, id),
        })),
      };

      // Auto-advance highlight if:
      // 1. The item was checked (not unchecked)
      // 2. Highlight current step setting is enabled
      if (wasUnchecked && settings.highlightCurrentStep) {
        const newFlatItems = flattenItems(newData);
        // Find the next unchecked item after the one just checked
        let nextIndex = -1;
        for (let i = toggledIndex + 1; i < newFlatItems.length; i++) {
          if (!newFlatItems[i].isCompleted) {
            nextIndex = i;
            break;
          }
        }
        // If no unchecked item found after, wrap around to find from the beginning
        if (nextIndex === -1) {
          for (let i = 0; i < toggledIndex; i++) {
            if (!newFlatItems[i].isCompleted) {
              nextIndex = i;
              break;
            }
          }
        }
        // Update the current item index (will trigger highlight update via useEffect)
        setCurrentItemIndex(nextIndex);
      }

      // Persist the updated state
      const newStates = extractTaskStates(newData);
      persistedTasksRef.current = newStates;
      window.electronAPI?.saveState(newStates).catch((error) => {
        console.error('Failed to save state:', error);
      });
      return newData;
    });
  }, [settings.highlightCurrentStep]);

  const handleSelectItem = useCallback((id: string) => {
    // Find the index of the item in the flattened list
    const flatItems = flattenItems(checklistData);
    const index = flatItems.findIndex((item) => item.id === id);
    if (index !== -1) {
      setCurrentItemIndex(index);
    }
  }, [checklistData]);

  const toggleHighlightSetting = () => {
    setSettings(prev => ({
      ...prev,
      highlightCurrentStep: !prev.highlightCurrentStep,
    }));
  };

  // Text scale adjustment functions
  const increaseTextScale = () => {
    setSettings(prev => ({
      ...prev,
      textScale: Math.min(TEXT_SCALE_MAX, Math.round((prev.textScale + TEXT_SCALE_STEP) * 10) / 10),
    }));
  };

  const decreaseTextScale = () => {
    setSettings(prev => ({
      ...prev,
      textScale: Math.max(TEXT_SCALE_MIN, Math.round((prev.textScale - TEXT_SCALE_STEP) * 10) / 10),
    }));
  };

  // Load a file from the library
  const loadFileFromLibrary = useCallback(async (filePath: string) => {
    try {
      const content = await window.electronAPI?.readFile(filePath);
      if (content) {
        const parsed = parseMarkdown(content);
        const converted = convertParsedToChecklistData(parsed);
        const withPersistedState = applyPersistedState(converted, persistedTasksRef.current);
        setChecklistData(withPersistedState);
        setLoadedFilePath(filePath);
        setCurrentItemIndex(-1);
      }
    } catch (error) {
      console.error('Failed to load file from library:', error);
    }
  }, []);

  // Add a file to the library
  const addFileToLibrary = async () => {
    try {
      const filePath = await window.electronAPI?.openFile();
      if (filePath) {
        // Extract file name from path
        const name = filePath.split('/').pop() || filePath.split('\\').pop() || filePath;
        // Check if already in library
        const alreadyExists = settings.fileLibrary.some(entry => entry.path === filePath);
        if (!alreadyExists) {
          setSettings(prev => ({
            ...prev,
            fileLibrary: [...prev.fileLibrary, { path: filePath, name }],
          }));
        }
        // Load the file
        await loadFileFromLibrary(filePath);
      }
    } catch (error) {
      console.error('Failed to add file to library:', error);
    }
  };

  // Remove a file from the library
  const removeFileFromLibrary = (filePath: string) => {
    setSettings(prev => ({
      ...prev,
      fileLibrary: prev.fileLibrary.filter(entry => entry.path !== filePath),
    }));
  };

  // Get display title from markdown or fallback
  const displayTitle = checklistData.title || 'DemoOverlay';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: theme.colors.containerBg,
      color: theme.colors.textPrimary,
      borderRadius: '12px',
      overflow: 'hidden',
      border: `1px solid ${theme.colors.border}`,
      transition: 'background-color 0.3s, color 0.3s, border-color 0.3s, font-size 0.2s',
      fontSize: `${settings.textScale * 100}%`,
    }}>
      {/* Draggable Header Area */}
      <div
        style={{
          // @ts-expect-error - WebkitAppRegion is a valid CSS property for Electron
          WebkitAppRegion: 'drag',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          backgroundColor: theme.colors.headerBg,
          borderBottom: `1px solid ${theme.colors.border}`,
          cursor: 'grab',
          userSelect: 'none',
          transition: 'background-color 0.3s, border-color 0.3s',
        }}
      >
        {/* Left side: Close button + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', flex: 1 }}>
          {/* Close button (red traffic light) */}
          <button
            onClick={() => window.electronAPI.closeWindow()}
            style={{
              // @ts-expect-error - WebkitAppRegion is a valid CSS property for Electron
              WebkitAppRegion: 'no-drag',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#ff5f57',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e0443e';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ff5f57';
            }}
            title="Close window"
            aria-label="Close window"
          />
          <h1 style={{
            fontSize: '0.875em',
            fontWeight: 600,
            margin: 0,
            color: theme.colors.textPrimary,
            transition: 'color 0.3s',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {displayTitle}
          </h1>
        </div>

        {/* Header buttons - must be no-drag */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'relative' }}>
          {/* Settings button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              // @ts-expect-error - WebkitAppRegion is a valid CSS property for Electron
              WebkitAppRegion: 'no-drag',
              padding: '4px 8px',
              fontSize: '0.6875em',
              backgroundColor: showSettings ? theme.colors.activeBg : theme.colors.buttonBg,
              color: theme.colors.textPrimary,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.2s, color 0.2s',
            }}
            title="Settings"
          >
            ⚙️
          </button>

          {/* Theme toggle button */}
          <button
            onClick={toggleTheme}
            style={{
              // @ts-expect-error - WebkitAppRegion is a valid CSS property for Electron
              WebkitAppRegion: 'no-drag',
              padding: '4px 8px',
              fontSize: '0.6875em',
              backgroundColor: theme.colors.buttonBg,
              color: theme.colors.textPrimary,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.2s, color 0.2s',
            }}
            title={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
          >
            {themeMode === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Settings dropdown */}
          {showSettings && (
            <div
              style={{
                // @ts-expect-error - WebkitAppRegion is a valid CSS property for Electron
                WebkitAppRegion: 'no-drag',
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                backgroundColor: theme.colors.containerBg,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '8px',
                padding: '8px',
                minWidth: '220px',
                maxWidth: '280px',
                zIndex: 100,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.75em',
                  color: theme.colors.textPrimary,
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <input
                  type="checkbox"
                  checked={settings.highlightCurrentStep}
                  onChange={toggleHighlightSetting}
                  style={{ cursor: 'pointer' }}
                />
                Highlight current step
              </label>

              {/* Text Size Setting */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px',
                  marginTop: '8px',
                }}
              >
                <span style={{
                  fontSize: '0.75em',
                  color: theme.colors.textPrimary,
                }}>
                  Text Size
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={decreaseTextScale}
                    disabled={settings.textScale <= TEXT_SCALE_MIN}
                    style={{
                      width: '24px',
                      height: '24px',
                      padding: 0,
                      fontSize: '0.875em',
                      fontWeight: 'bold',
                      backgroundColor: settings.textScale <= TEXT_SCALE_MIN
                        ? theme.colors.borderLight
                        : theme.colors.buttonBg,
                      color: settings.textScale <= TEXT_SCALE_MIN
                        ? theme.colors.textMuted
                        : theme.colors.textPrimary,
                      border: 'none',
                      borderRadius: '4px',
                      cursor: settings.textScale <= TEXT_SCALE_MIN ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Decrease text size"
                  >
                    −
                  </button>
                  <span style={{
                    fontSize: '0.6875em',
                    color: theme.colors.textPrimary,
                    minWidth: '36px',
                    textAlign: 'center',
                  }}>
                    {Math.round(settings.textScale * 100)}%
                  </span>
                  <button
                    onClick={increaseTextScale}
                    disabled={settings.textScale >= TEXT_SCALE_MAX}
                    style={{
                      width: '24px',
                      height: '24px',
                      padding: 0,
                      fontSize: '0.875em',
                      fontWeight: 'bold',
                      backgroundColor: settings.textScale >= TEXT_SCALE_MAX
                        ? theme.colors.borderLight
                        : theme.colors.buttonBg,
                      color: settings.textScale >= TEXT_SCALE_MAX
                        ? theme.colors.textMuted
                        : theme.colors.textPrimary,
                      border: 'none',
                      borderRadius: '4px',
                      cursor: settings.textScale >= TEXT_SCALE_MAX ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Increase text size"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* File Library Section */}
              <div style={{
                marginTop: '12px',
                borderTop: `1px solid ${theme.colors.border}`,
                paddingTop: '8px',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}>
                  <span style={{
                    fontSize: '0.6875em',
                    fontWeight: 600,
                    color: theme.colors.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Markdown Files
                  </span>
                  <button
                    onClick={addFileToLibrary}
                    style={{
                      padding: '2px 6px',
                      fontSize: '0.625em',
                      backgroundColor: theme.colors.accent,
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                    title="Add markdown file"
                  >
                    + Add
                  </button>
                </div>

                {/* File list */}
                <div style={{
                  maxHeight: '150px',
                  overflowY: 'auto',
                }}>
                  {settings.fileLibrary.length === 0 ? (
                    <div style={{
                      fontSize: '0.6875em',
                      color: theme.colors.textSecondary,
                      fontStyle: 'italic',
                      padding: '4px',
                    }}>
                      No files added
                    </div>
                  ) : (
                    settings.fileLibrary.map((entry) => (
                      <div
                        key={entry.path}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px',
                          borderRadius: '4px',
                          backgroundColor: loadedFilePath === entry.path
                            ? theme.colors.activeBg
                            : 'transparent',
                        }}
                      >
                        <button
                          onClick={() => loadFileFromLibrary(entry.path)}
                          style={{
                            flex: 1,
                            textAlign: 'left',
                            padding: '2px 4px',
                            fontSize: '0.6875em',
                            backgroundColor: 'transparent',
                            color: loadedFilePath === entry.path
                              ? theme.colors.activeText
                              : theme.colors.textPrimary,
                            border: 'none',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontWeight: loadedFilePath === entry.path ? 600 : 400,
                          }}
                          title={entry.path}
                        >
                          {loadedFilePath === entry.path && '● '}
                          {entry.name}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFileFromLibrary(entry.path);
                          }}
                          style={{
                            padding: '0 4px',
                            fontSize: '0.75em',
                            backgroundColor: 'transparent',
                            color: theme.colors.textSecondary,
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
                          title="Remove from library"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close settings */}
      {showSettings && (
        <div
          onClick={() => setShowSettings(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 50,
          }}
        />
      )}

      {/* Checklist Content Area */}
      <Checklist data={checklistData} onToggleItem={handleToggleItem} onSelectItem={handleSelectItem} />
    </div>
  );
};

export default App;
