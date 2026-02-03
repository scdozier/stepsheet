import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

// State shape: maps task IDs to their completion status
export interface TaskState {
  [taskId: string]: boolean;
}

// File library entry
export interface FileLibraryEntry {
  path: string;
  name: string;
}

// App settings
export interface AppSettings {
  highlightCurrentStep: boolean;
  fileLibrary: FileLibraryEntry[];
  textScale: number;
}

export interface AppState {
  version: number;
  tasks: TaskState;
  settings: AppSettings;
  lastUpdated: string;
}

const STATE_VERSION = 2;
const STATE_FILE_NAME = 'stepsheet-state.json';

const DEFAULT_SETTINGS: AppSettings = {
  highlightCurrentStep: true,
  fileLibrary: [],
  textScale: 1.0,
};

function getStateFilePath(): string {
  return path.join(app.getPath('userData'), STATE_FILE_NAME);
}

function createDefaultState(): AppState {
  return {
    version: STATE_VERSION,
    tasks: {},
    settings: DEFAULT_SETTINGS,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Load state from JSON file
 * Returns default state if file doesn't exist or is invalid
 */
export function loadState(): AppState {
  const filePath = getStateFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      const state = JSON.parse(data) as AppState;
      // Validate state has required fields
      if (state && typeof state.tasks === 'object') {
        return {
          ...createDefaultState(),
          ...state,
          // Merge settings with defaults in case new settings are added
          settings: {
            ...DEFAULT_SETTINGS,
            ...(state.settings || {}),
          },
          version: STATE_VERSION, // Always use current version
        };
      }
    }
  } catch (error) {
    console.error('Failed to load state:', error);
  }
  return createDefaultState();
}

/**
 * Save state to JSON file
 */
export function saveState(state: AppState): void {
  const filePath = getStateFilePath();
  try {
    const stateToSave: AppState = {
      ...state,
      version: STATE_VERSION,
      lastUpdated: new Date().toISOString(),
    };
    fs.writeFileSync(filePath, JSON.stringify(stateToSave, null, 2));
  } catch (error) {
    console.error('Failed to save state:', error);
    throw error;
  }
}

/**
 * Toggle a task's completion status
 * Returns the new state
 */
export function toggleTask(taskId: string): AppState {
  const state = loadState();
  state.tasks[taskId] = !state.tasks[taskId];
  saveState(state);
  return state;
}

/**
 * Reset all task state (but keep settings)
 * Returns the new state
 */
export function resetState(): AppState {
  const currentState = loadState();
  const state: AppState = {
    ...createDefaultState(),
    settings: currentState.settings, // Preserve settings
  };
  saveState(state);
  return state;
}

/**
 * Get completion status for a specific task
 */
export function getTaskStatus(taskId: string): boolean {
  const state = loadState();
  return state.tasks[taskId] ?? false;
}

/**
 * Update multiple tasks at once
 */
export function updateTasks(tasks: TaskState): AppState {
  const state = loadState();
  state.tasks = { ...state.tasks, ...tasks };
  saveState(state);
  return state;
}

/**
 * Load settings
 */
export function loadSettings(): AppSettings {
  const state = loadState();
  return state.settings;
}

/**
 * Save settings
 */
export function saveSettings(settings: AppSettings): AppState {
  const state = loadState();
  state.settings = settings;
  saveState(state);
  return state;
}
