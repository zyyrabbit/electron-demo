/*
 * @Description: fun desc of file
 * @Date: 2020-02-08 18:04:18
 * @Author: Lemon
 * @LastEditors: Lemon
 * @LastEditTime: 2020-02-08 18:28:06
 */
'use strict'

import { 
  app, 
  BrowserWindow,
  globalShortcut,
  shell
} from 'electron'

import bootstrap from './bootstrap'
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow: BrowserWindow | null
const winURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:9080'
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 520,
    useContentSize: true,
    width: 370,
    show: false,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      devTools: true
    },
    frame: false
  });

  bootstrap(mainWindow)

  mainWindow.webContents.on('did-finish-load', (): void => {
    mainWindow && mainWindow.show()
  });

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.loadURL(winURL)
  
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
}

app.on('ready', () => {
  const Shortcut = {
    devTools: 'CommandOrControl+Shift+Alt+I',
    log: 'CommandOrControl+Shift+Alt+O',
  };

  globalShortcut.register(Shortcut.devTools, () => {
    let win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.webContents.openDevTools();
    }
  });

  globalShortcut.register(Shortcut.log, () => {
    shell.showItemInFolder(app.getPath('userData'));
  });

  createWindow();
})

app.on('window-all-closed', () => {
  //if (process.platform !== 'darwin') {
    app.$log && app.$log.info('[File-sync exit]')
    app.quit()
  //}
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// 允许chrome自动播放多媒体
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')

// 忽略证书相关错误
app.commandLine.appendSwitch('ignore-certificate-errors')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'   

console.log('chrome', process.versions.chrome);

console.log('apppath', app.getAppPath());
console.log('userData', app.getPath('userData'));
  

