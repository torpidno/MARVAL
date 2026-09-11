const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  saveProgress: (data) => ipcRenderer.invoke('save-progress', data),
  loadProgress: () => ipcRenderer.invoke('load-progress')
});
