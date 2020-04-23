export enum MSG_TYPE {
  RENDER = 'RENDER',
  MAIN = 'MAIN',
  CLIENT = 'CLIENT'
}

export enum RetCode {
  SUCCESS = '0000',  // 成功     
}

export type extendable = { [index: string]:any }

export interface ResponseType {
  retcode: RetCode,
  id: string,
  params: extendable
}


export interface IPC {
  send(...args: Array<any>): void;
  on(type: string, cb: Function): void;
}

export interface MainIPC extends IPC {
  addListener(chanel: string, cb: Function): void;
}

export interface RenderIPC extends IPC {
  send(...args: Array<any>): Promise<void>;
  sendToClient(funcName: string, param?: object): Promise<void>;
  only(type: string, cb: Function): void;
}