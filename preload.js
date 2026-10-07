'use strict';
const { contextBridge, ipcRenderer } = require('electron');

// Synchronous snapshot so the page can use a localStorage-like API right at startup.
const boot = ipcRenderer.sendSync('store:boot');

contextBridge.exposeInMainWorld('aysudaDesktop', {
  config: boot.config,
  dataDir: boot.dataDir,
  getAll: () => boot.data,
  set: (k, v) => ipcRenderer.send('store:set', k, v),
  remove: (k) => ipcRenderer.send('store:remove', k),
  clear: () => ipcRenderer.send('store:clear'),
  backupCreate: () => ipcRenderer.invoke('backup:create'),
  backupRestore: () => ipcRenderer.invoke('backup:restore'),
  openBackupFolder: () => ipcRenderer.send('backup:openFolder'),
  refocus: () => ipcRenderer.send('win:refocus')
});
