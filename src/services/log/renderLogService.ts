import { ConsoleLogService, IPCLOG } from '@/services/log/LogService'

export default new ConsoleLogService((...args: any[]) => {
  // @ts-ignore
  window.$IPC.send(IPCLOG, ...args)
})