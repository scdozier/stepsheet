import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

// State shape: maps task IDs to their completion status
export interface TaskState {
  [taskId: string]: boolean;
}

export interface AppState {
  version: number;
  tasks: TaskState;
  lastUpdated: string;
}

const STATE_VERSION = 1;
const STATE_FILE_NAME = 'demo-state.json';

function getStateFilePath(): string {
  return path.join(app.getPath('userData'), STATE_FILE_NAME);
}

function createDefaultState(): AppState {
  return {
    version: STATE_VERSION,
    tasks: {},
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
 * Reset all task state
 * Returns the new empty state
 */
export function resetState(): AppState {
  const state = createDefaultState();
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

