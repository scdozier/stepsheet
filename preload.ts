import { contextBridge, ipcRenderer } from 'electron';

// File library entry type
interface FileLibraryEntry {
  path: string;
  name: string;
}

// App settings type
interface AppSettingsData {
  highlightCurrentStep: boolean;
  fileLibrary: FileLibraryEntry[];
  textScale: number;
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  readFile: (filePath: string) => ipcRenderer.invoke('file:read', filePath),

  // State operations
  saveState: (state: Record<string, boolean>) => ipcRenderer.invoke('state:save', state),
  loadState: () => ipcRenderer.invoke('state:load'),
  resetState: () => ipcRenderer.invoke('state:reset'),

  // Settings operations
  saveSettings: (settings: AppSettingsData) => ipcRenderer.invoke('settings:save', settings),
  loadSettings: () => ipcRenderer.invoke('settings:load'),

  // Window operations
  hideWindow: () => ipcRenderer.send('window:hide'),
  closeWindow: () => ipcRenderer.send('window:close'),
  showWindow: () => ipcRenderer.send('window:show'),

  // Click-through toggle (for overlay mode)
  setClickThrough: (enable: boolean) => ipcRenderer.send('window:setClickThrough', enable),
  getClickThrough: () => ipcRenderer.invoke('window:getClickThrough'),

  // Event listeners
  onFileSelected: (callback: (filePath: string) => void) => {
    ipcRenderer.on('file:selected', (_event, filePath) => callback(filePath));
  },
  onToggleVisibility: (callback: () => void) => {
    ipcRenderer.on('window:toggle', () => callback());
  },

  // Global shortcut event listeners
  onNextItem: (callback: () => void) => {
    ipcRenderer.on('shortcut:nextItem', () => callback());
  },
  onCompleteItem: (callback: () => void) => {
    ipcRenderer.on('shortcut:completeItem', () => callback());
  },
  onReload: (callback: () => void) => {
    ipcRenderer.on('shortcut:reload', () => callback());
  },

  // Tray menu event listeners
  onClickThroughChanged: (callback: (enabled: boolean) => void) => {
    ipcRenderer.on('clickThrough:changed', (_event, enabled) => callback(enabled));
  },
  onStateReset: (callback: () => void) => {
    ipcRenderer.on('state:reset', () => callback());
  },
});

// State type for renderer process
interface TaskStateMap {
  [taskId: string]: boolean;
}

interface AppStateData {
  version: number;
  tasks: TaskStateMap;
  settings: AppSettingsData;
  lastUpdated: string;
}

// Type declaration for the exposed API
declare global {
  interface Window {
    electronAPI: {
      openFile: () => Promise<string | null>;
      readFile: (filePath: string) => Promise<string>;
      saveState: (state: TaskStateMap) => Promise<AppStateData>;
      loadState: () => Promise<AppStateData>;
      resetState: () => Promise<AppStateData>;
      saveSettings: (settings: AppSettingsData) => Promise<AppSettingsData>;
      loadSettings: () => Promise<AppSettingsData>;
      hideWindow: () => void;
      closeWindow: () => void;
      showWindow: () => void;
      setClickThrough: (enable: boolean) => void;
      getClickThrough: () => Promise<boolean>;
      onFileSelected: (callback: (filePath: string) => void) => void;
      onToggleVisibility: (callback: () => void) => void;
      onNextItem: (callback: () => void) => void;
      onCompleteItem: (callback: () => void) => void;
      onReload: (callback: () => void) => void;
      onClickThroughChanged: (callback: (enabled: boolean) => void) => void;
      onStateReset: (callback: () => void) => void;
    };
  }
}
