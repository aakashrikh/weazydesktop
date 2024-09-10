// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Expose limited IPC methods to the renderer process
contextBridge.exposeInMainWorld('electron', {
  send: (channel, data) => {
    const validChannels = ['print'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    const validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  saveCredentials: (service, data) => ipcRenderer.invoke('save-credentials', service,JSON.stringify(data)),
  getCredentials: (service) => ipcRenderer.invoke('get-credentials', service),
  deleteCredentials: (service)=> ipcRenderer.invoke('delete-credentials', service)

});