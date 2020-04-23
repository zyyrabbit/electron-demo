import {
  IPC
} from '@/services/ipc/common'
import {
  Logger
} from '@/services/log/LogService'
export enum UpdaterType {
  UPDATER = 'updater',
  CHECK = 'updater-check',
  CHECKING = 'updater-checking',
  INSTALL = 'updater-install',
  ERROR = 'updater-error',
  AVAILABLE = 'update-available',
  NOT_AVAILABLE = 'update-not-available',
  PROGRESS = 'download-progress',
  DOWNLOADED = 'update-downloaded',
  DOWNLOAD_UPDATE = 'download-update'
}

export interface Options {
  feedUrl: string,
  $IPC: IPC,
  $log: Logger,
  autoDownload?: boolean,
}