
import {
  MSG_TYPE,
  MainIPC
} from './common'
import {
  app
} from 'electron'
export default class MainIpcService implements MainIPC {

  private listener: any
  private sender: any
  private handlerMap = new Map<string, any>()
  
  constructor(listener: any, sender: any) {
    this.listener = listener
    this.sender = sender
    this.addListener(MSG_TYPE.MAIN, this.handleFn.bind(this))
  }

  private async handleFn(event: any, ...args: Array<any>) {
    try {
      const type = args.shift()
      if (this.handlerMap.has(type)) {
        console.log('[ipc main handle]', ...args)
        return await this.handlerMap.get(type)(...args)
      }
    } catch (e) {
      app.$log.error(e.message)
    }
  }

  public on(type: string, cb: Function) {
    this.handlerMap.set(type, cb)
  }

  public send(type: string, ...args: any[]) {
    console.log('[ipc main send]', ...args)
    args.unshift(type)
    this.sender.send(MSG_TYPE.RENDER, args)
  }

  public addListener(chanel: string, cb: Function) {
    this.listener.handle(chanel, cb)
  }

}
