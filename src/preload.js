//const {ipcRenderer, contextBridge} = require('electron')
import {ipcRenderer, contextBridge} from 'electron';

console.log('preload')
contextBridge.exposeInMainWorld('electronAPI', {
    onUpdateFile: (callback) => { ipcRenderer.on('update-file', (_event, value) => callback(value)) },
    updateFile: (file) => ipcRenderer.invoke('change-file', file)
})
