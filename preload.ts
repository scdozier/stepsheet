import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations (to be implemented in later tasks)
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  readFile: (filePath: string) => ipcRenderer.invoke('file:read', filePath),

  // State operations
  saveState: (state: Record<string, boolean>) => ipcRenderer.invoke('state:save', state),
  loadState: () => ipcRenderer.invoke('state:load'),
  resetState: () => ipcRenderer.invoke('state:reset'),

  // Window operations
  hideWindow: () => ipcRenderer.send('window:hide'),
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
      hideWindow: () => void;
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

