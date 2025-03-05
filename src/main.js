import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron';
import path from 'node:path';
const nativeImage = require('electron').nativeImage;
import started from 'electron-squirrel-startup';
import File from './fileReader.js';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let filePath = '';
let currentFile = new File();

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({})
  if (!canceled) {
    filePath = filePaths[0];
    return File.readFromFile(filePaths[0]);
  }
}

async function saveFile(path) {
  currentFile.saveToFile(path);
}

async function saveAs() {
  const result = await dialog.showSaveDialog({
    title: "Save Board As",
    filters: [{ name: 'Boards', extensions: ['wtbd'] }]
  });

  if (!result.canceled) {
    filePath = result.filePath;
    saveFile(filePath);
  }
}



const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: "Whiteboard",
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  const isMac = process.platform === 'darwin'

  const template = [
    ...(isMac
      ? [{
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      }]
      : []),
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        isMac ? { role: 'close' } : { role: 'quit' },
        {
          label: 'Open File',
          click: async () => {
            const file = await handleFileOpen();
            mainWindow.webContents.send('update-file', file);
          }
        },
        {
          label: 'Save As',
          click: async () => {
            await saveAs();
          }
        },
        {
          label: 'Save',
          click: async () => {
            await saveFile(filePath);
          }
        }
      ]
    },
    // { role: 'editMenu' }
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac
          ? [
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'selectAll' },
            { type: 'separator' },
            {
              label: 'Speech',
              submenu: [
                { role: 'startSpeaking' },
                { role: 'stopSpeaking' }
              ]
            }
          ]
          : [
            { role: 'delete' },
            { type: 'separator' },
            { role: 'selectAll' }
          ])
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    // { role: 'windowMenu' }
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [
            { type: 'separator' },
            { role: 'front' },
            { type: 'separator' },
            { role: 'window' }
          ]
          : [
            { role: 'close' }
          ])
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();


  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});



ipcMain.handle("get-file", () => currentFile);

ipcMain.handle("change-file", (event, file) => {
  currentFile.name = file.name;
  currentFile.lines = file.lines;
  currentFile.stickers = file.stickers;
})

ipcMain.handle("get-fonts", async () => {
  return "test";
})


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const image = nativeImage.createFromPath(path.join(__dirname, "../../assets/icon.png"))
app.dock.setIcon(image);

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
