const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const os = require('os');

// Suppress Chromium Windows cache permission/lock warnings
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-http-cache');

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

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1380,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'Marvel Watch Progress Tracker',
    backgroundColor: '#070913',
    icon: getAppIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.setMenu(null); // Frameless modern UI

  // Forward console messages from React to Electron terminal
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer] [Level ${level}] ${message} (line ${line} in ${path.basename(sourceId)})`);
  });

  const distPath = path.join(__dirname, '../dist/index.html');

  if (fs.existsSync(distPath)) {
    mainWindow.loadFile(distPath);
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Start local HTTP Sync Server
const syncServer = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/sync' && req.method === 'GET') {
    try {
      if (fs.existsSync(DATA_FILE_PATH)) {
        const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(raw);
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({}));
      }
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }
  } else if (req.url === '/sync' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const dir = path.dirname(DATA_FILE_PATH);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');

        // Notify React frontend window if open
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('sync-update', data);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

syncServer.listen(5176, '0.0.0.0', () => {
  console.log('Local sync server listening on port 5176');
});

// IPC Handlers
ipcMain.handle('save-progress', async (event, data) => {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
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

ipcMain.handle('get-ip', async () => {
  try {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (const name in interfaces) {
      for (const net of interfaces[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          addresses.push(net.address);
        }
      }
    }
    return addresses[0] || '127.0.0.1';
  } catch (e) {
    return '127.0.0.1';
  }
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
