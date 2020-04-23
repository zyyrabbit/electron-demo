'use strict'
import { autoUpdater, AppUpdater } from 'electron-updater'

import {
  UpdaterType,
  Options
} from './common'
import {
  IPC
} from '@/services/ipc/common'
import {
  Logger
} from '@/services/log/LogService'

export default class UpdaterService {
  private $IPC: IPC
  private $log: Logger
  private appUpdater: AppUpdater
  
  constructor(options: Options) {
    const { feedUrl = 'http://127.0.0.1/', autoDownload = true, $IPC, $log } = options
    this.$IPC = $IPC
    this.$log = $log
    this.appUpdater = autoUpdater
    this.appUpdater.autoDownload = autoDownload
    this.appUpdater.setFeedURL(feedUrl)
    
    this.registerListener()
    this.registerUpdaterListener()
  }

  private registerListener() {
    // 主进程监听渲染进程传来的信息
    this.$IPC.on(UpdaterType.CHECK, (e: Event, arg: any) => {
      this.$log.info('[updater-check]')
      this.appUpdater.checkForUpdates()
    })

    this.$IPC.on(UpdaterType.DOWNLOAD_UPDATE, (e: Event, arg: any) => {
      this.$log.info('[download-update]')
      this.appUpdater.downloadUpdate()
    })

    this.$IPC.on(UpdaterType.INSTALL, (e: Event, arg: any) => {
      this.$log.info('[updater-install]')
      this.appUpdater.quitAndInstall()
    })
  }

  private registerUpdaterListener() {
    // 下面是自动更新的整个生命周期所发生的事件
    this.appUpdater.on('error', (message) => {
      this.sendUpdateMessage(UpdaterType.ERROR, message)
    })

    this.appUpdater.on('checking-for-update', (message) => {
      this.sendUpdateMessage(UpdaterType.CHECKING, message)
    })

    this.appUpdater.on('update-available', (message) => {
      this.sendUpdateMessage(UpdaterType.AVAILABLE, message)
    })

    this.appUpdater.on('update-not-available', (message) => {
      this.sendUpdateMessage(UpdaterType.NOT_AVAILABLE, message)
    })

    // 更新下载进度事件
    this.appUpdater.on('download-progress', (progress) => {
      this.sendUpdateMessage(UpdaterType.PROGRESS, progress)
    })

    // 更新下载完成事件
    this.appUpdater.on('update-downloaded',(
      event, 
      releaseNotes, 
      releaseName, 
      releaseDate, 
      updateUrl, 
      quitAndUpdate) => {
      this.sendUpdateMessage(UpdaterType.DOWNLOADED)
    })
  }

  // 主进程主动发送消息给渲染进程函数
  private sendUpdateMessage(message: string, data?: any) {
    if (message !== UpdaterType.PROGRESS) {
      this.$log.info('[updater-message]', message, data)
    }
    this.$IPC.send(message, data)
  }
}