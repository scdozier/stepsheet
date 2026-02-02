import { app, BrowserWindow, ipcMain, screen, dialog, globalShortcut, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { loadState, saveState, resetState, AppState, TaskState } from './src/state/stateManager';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isClickThrough = false;
let isWindowVisible = true;

// Window state persistence
interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
}

const stateFilePath = path.join(app.getPath('userData'), 'window-state.json');

function loadWindowState(): WindowState | null {
  try {
    if (fs.existsSync(stateFilePath)) {
      const data = fs.readFileSync(stateFilePath, 'utf-8');
      return JSON.parse(data) as WindowState;
    }
  } catch (error) {
    console.error('Failed to load window state:', error);
  }
  return null;
}

function saveWindowState(): void {
  if (!mainWindow) return;
  try {
    const bounds = mainWindow.getBounds();
    const state: WindowState = {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    };
    fs.writeFileSync(stateFilePath, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error('Failed to save window state:', error);
  }
}

function getDefaultBounds(): WindowState {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
  const windowWidth = 400;
  const windowHeight = 600;
  return {
    x: screenWidth - windowWidth - 20,
    y: 20,
    width: windowWidth,
    height: windowHeight,
  };
}

function createWindow(): void {
  const savedState = loadWindowState();
  const bounds = savedState || getDefaultBounds();

  mainWindow = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    // Overlay configuration
    transparent: true,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 12, y: 12 },
    alwaysOnTop: true,
    resizable: true,
    hasShadow: false,
    skipTaskbar: true,
    backgroundColor: '#00000000',
    // macOS specific
    vibrancy: undefined,
    visualEffectState: 'active',
  });

  mainWindow.loadFile('index.html');

  // Keep window always on top with floating level
  mainWindow.setAlwaysOnTop(true, 'floating');

  // Save window state on move/resize
  mainWindow.on('moved', saveWindowState);
  mainWindow.on('resized', saveWindowState);

  // Open DevTools in development (detached so it doesn't affect overlay)
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray(): void {
  // Use Template image for macOS dark/light mode support
  const iconPath = path.join(__dirname, '..', 'assets', 'iconTemplate.png');
  const icon = nativeImage.createFromPath(iconPath);
  icon.setTemplateImage(true);

  tray = new Tray(icon);
  tray.setToolTip('Demo Overlay');

  updateTrayMenu();
}

function updateTrayMenu(): void {
  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Load Markdown File...',
      click: async () => {
        const result = await dialog.showOpenDialog({
          properties: ['openFile'],
          filters: [
            { name: 'Markdown Files', extensions: ['md', 'markdown'] },
            { name: 'All Files', extensions: ['*'] },
          ],
        });

        if (!result.canceled && result.filePaths.length > 0) {
          const filePath = result.filePaths[0];
          mainWindow?.webContents.send('file:selected', filePath);
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Toggle Overlay',
      accelerator: 'CommandOrControl+Shift+H',
      click: () => {
        if (!mainWindow) return;
        if (isWindowVisible) {
          mainWindow.hide();
          isWindowVisible = false;
        } else {
          mainWindow.show();
          isWindowVisible = true;
        }
        updateTrayMenu();
      },
    },
    {
      label: isClickThrough ? '✓ Click-Through Mode' : 'Click-Through Mode',
      click: () => {
        if (!mainWindow) return;
        isClickThrough = !isClickThrough;
        mainWindow.setIgnoreMouseEvents(isClickThrough, { forward: true });
        mainWindow.webContents.send('clickThrough:changed', isClickThrough);
        updateTrayMenu();
      },
    },
    { type: 'separator' },
    {
      label: 'Reset Checklist',
      click: async () => {
        try {
          await resetState();
          mainWindow?.webContents.send('state:reset');
        } catch (error) {
          console.error('Failed to reset state:', error);
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      accelerator: 'CommandOrControl+Q',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

// IPC handlers for click-through toggle
ipcMain.on('window:setClickThrough', (_event, enable: boolean) => {
  if (!mainWindow) return;
  isClickThrough = enable;
  mainWindow.setIgnoreMouseEvents(enable, { forward: true });
  updateTrayMenu(); // Keep tray menu in sync
});

ipcMain.handle('window:getClickThrough', () => {
  return isClickThrough;
});

// IPC handlers for window visibility
ipcMain.on('window:close', () => {
    if (mainWindow) {
      mainWindow.close();
    }
  });

  ipcMain.on('window:hide', () => {
  mainWindow?.hide();
});

ipcMain.on('window:show', () => {
  mainWindow?.show();
});

// IPC handler for opening file dialog
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'markdown'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  // Notify renderer of the selected file
  mainWindow?.webContents.send('file:selected', filePath);
  return filePath;
});

// IPC handler for reading file contents
ipcMain.handle('file:read', async (_event, filePath: string) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Failed to read file:', error);
    throw error;
  }
});

// IPC handlers for task state persistence
ipcMain.handle('state:load', () => {
  try {
    return loadState();
  } catch (error) {
    console.error('Failed to load state:', error);
    throw error;
  }
});

ipcMain.handle('state:save', (_event, tasks: TaskState) => {
  try {
    const state: AppState = {
      version: 1,
      tasks,
      lastUpdated: new Date().toISOString(),
    };
    saveState(state);
    return state;
  } catch (error) {
    console.error('Failed to save state:', error);
    throw error;
  }
});

ipcMain.handle('state:reset', () => {
  try {
    return resetState();
  } catch (error) {
    console.error('Failed to reset state:', error);
    throw error;
  }
});

function registerGlobalShortcuts(): void {
  // Cmd+Shift+N - Jump to next unchecked item
  globalShortcut.register('CommandOrControl+Shift+N', () => {
    mainWindow?.webContents.send('shortcut:nextItem');
  });

  // Cmd+Shift+X - Mark current item complete
  globalShortcut.register('CommandOrControl+Shift+X', () => {
    mainWindow?.webContents.send('shortcut:completeItem');
  });

  // Cmd+Shift+H - Show/hide overlay window
  globalShortcut.register('CommandOrControl+Shift+H', () => {
    if (!mainWindow) return;
    if (isWindowVisible) {
      mainWindow.hide();
      isWindowVisible = false;
    } else {
      mainWindow.show();
      isWindowVisible = true;
    }
    mainWindow.webContents.send('window:toggle');
  });

  // Cmd+Shift+R - Reload markdown file
  globalShortcut.register('CommandOrControl+Shift+R', () => {
    mainWindow?.webContents.send('shortcut:reload');
  });
}

function unregisterGlobalShortcuts(): void {
  globalShortcut.unregisterAll();
}

app.whenReady().then(() => {
  // Hide dock icon - this makes it a menu bar app
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  createWindow();
  createTray();
  registerGlobalShortcuts();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Don't quit when window closes on macOS (menu bar app behavior)
app.on('window-all-closed', () => {
  // Keep the app running in menu bar even when window is closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Save state before quitting
app.on('before-quit', () => {
  saveWindowState();
});

// Unregister shortcuts when quitting to avoid conflicts
app.on('will-quit', () => {
  unregisterGlobalShortcuts();
});

