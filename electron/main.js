const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

if (process.platform === 'win32') {
  app.setAppUserModelId('com.marvel.watchtracker');
}

const DATA_FILE_PATH = path.join(app.getPath('userData'), 'marvel_watch_progress.json');

function getAppIconPath() {
  const pngPath = path.join(__dirname, '../public/icon.png');
  const buildPng = path.join(__dirname, '../build/icon.png');
  if (fs.existsSync(pngPath)) return pngPath;
  if (fs.existsSync(buildPng)) return buildPng;
  return undefined;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1380,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'Marvel Watch Progress Tracker',
    backgroundColor: '#070913',
    icon: getAppIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.setMenu(null); // Clean frameless look or standard menu

  const isDev = !app.isPackaged;
  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// IPC Handlers for disk saving
ipcMain.handle('save-progress', async (event, data) => {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Failed to save watch progress to disk:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-progress', async () => {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const rawData = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      return JSON.parse(rawData);
    }
  } catch (error) {
    console.error('Failed to load watch progress from disk:', error);
  }
  return null;
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
