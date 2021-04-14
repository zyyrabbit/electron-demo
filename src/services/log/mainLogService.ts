import {
  app
} from 'electron'
import {
  Logger,
  IPCLOG
} from './LogService'

type LevelType = Exclude<keyof Logger, 'getLevel' | 'setLevel' | 'upload'>

export default function() {
  app.$IPC.on(IPCLOG, ((level: LevelType, ...params: any[]) => {
    app.$log[level](...params);
  }))
}