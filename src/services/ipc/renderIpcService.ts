import { ipcRenderer }  from 'electron'
import {
  MSG_TYPE,
  RenderIPC,
  RetCode,
  ResponseType
} from './common'

export default class RendererIpcService implements RenderIPC{
  private callbackMap: Map<string, Function[]> = new Map<string, Function[]>()

  constructor() {
    ipcRenderer.on(MSG_TYPE.RENDER, (sender: any, args: Array<any>) => {
      try {
        const type = args.shift()
        console.log('[ipc render recevied]', type, args)
        const cbs = this.callbackMap.get(type)
        cbs && cbs.forEach((cb: Function) => cb(...args))
      } catch(e) {
        console.error('[ipc renderer wrong]', e)
      }
    })
  }

  async send(...args: Array<any>) {
    console.log('[ipc renderer send]', args[1], args)
    return await ipcRenderer.invoke(MSG_TYPE.MAIN, ...args)
  }

  async sendToClient(funcName: string, param?: object, timeout?: number): Promise<any> {
    const rst: ResponseType = await this.send(MSG_TYPE.CLIENT, funcName, param, timeout)
    if (rst && (rst.retcode !== RetCode.SUCCESS)) {
      throw new Error(rst.retcode)
    }
    return rst
  }

  on(type: string, cb: Function) {
    if (this.callbackMap.has(type)) {
      this.callbackMap.get(type)!.push(cb)
      return
    }
    this.callbackMap.set(type, [cb])
  }

  only(type: string, cb: Function) {
    this.callbackMap.set(type, [cb])
  }

  off(type: string, cb: Function) {
    const callbackMap = this.callbackMap
    const cbs = callbackMap.get(type)
    if (!cbs) return;
    if (!cb) callbackMap.delete(type)
    cbs.some((item: Function, index: number) => {
      if (cb === item) {
        cbs.splice(index, 1)
        return true
      }
    })
  }

}