import {
  app,
  ipcMain, 
} from 'electron'
import MainIpcService from '@/services/ipc/mainIpcService'
import mainWidowService from '@/services/window/mainWindowService'
import logService from '@/services/log'
import UpdaterService from '@/services/updater/mainUpdaterService'

export default function(win: any) {
  app.$win = win
  app.$IPC = new MainIpcService(ipcMain, win.webContents)
  app.$log = logService
  mainWidowService()
  new UpdaterService({
    feedUrl: __FEED_URL,
    $IPC: app.$IPC,
    $log: app.$log,
    autoDownload: false
  })
  
}