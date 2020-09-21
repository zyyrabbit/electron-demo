import { Event, Listener, Handler } from './event';

export enum IPCEvent {
  CONNECT = 'ipc:connect',
  MESSAGE = 'ipc:message',
  DISCONNECT = 'ipc:disconnect'
}

export const enum RequestType {
  Promise = 100,
  Notice,
	PromiseCancel,
	EventListen,
	EventDispose
}

export interface RawNoticeRequest {
  type: RequestType.Notice
  channelName: string
  name: string
  arg: any
}

export interface RawPromiseRequest {
  type: RequestType.Promise
  id: string
  channelName: string
  name: string
  arg: any
}

export interface RawEventListenRequest {
  type: RequestType.EventListen
  id: string
  channelName: string
  name: string
  arg: any
}

export interface RawEventDisposeRequest {
  type: RequestType.EventDispose
  id: string
}

export type RawRequest = RawNoticeRequest | RawPromiseRequest | RawEventListenRequest | RawEventDisposeRequest

export const enum ResponseType {
	Initialize = 200,
	PromiseSuccess = 201,
	PromiseError = 202,
	PromiseErrorObj = 203,
	EventFire = 204
}

export interface RawInitializeResponse {
  type: ResponseType.Initialize
}
export interface RawPromiseSuccessResponse {
  type: ResponseType.PromiseSuccess
  id: string
  data: any
}
export interface RawPromiseErrorResponse {
  type: ResponseType.PromiseError
  id: string
  data: {
    message: string
    code?: number
    name: string
    stack: string | string[] | undefined
  }
}
export interface RawPromiseErrorObjResponse {
  type: ResponseType.PromiseErrorObj
  id: string
  data: any
}
export interface RawEventFireResponse {
  type: ResponseType.EventFire
  id: string
  data: any
}

export type RawResponse = RawPromiseSuccessResponse | RawPromiseErrorResponse | RawPromiseErrorObjResponse | RawEventFireResponse

export class IPCRequestError extends Error {
  public readonly code: number

  public constructor (message: string, code?: number) {
    super(message);
    this.code = code || 0;
  }
}

export interface Sender {
	send(...args: any[]): void;
}


export interface Channel {
	call<T>(command: string, arg?: any): Promise<T>
}

export interface RawResponseListenHandler {
  (response:RawResponse): void
}

export interface PendingRequest {
	request: RawPromiseRequest | RawEventListenRequest | RawNoticeRequest
	timeoutTimer: any
}


export interface MessagePassingProtocol {
	send(msg: any): void
	onMessage: Listener
}

export const createProtocol = function(sender: Sender, onMessage: Listener) {
  return {
    send(message: any): void {
      try {
        sender.send(IPCEvent.MESSAGE, message);
      } catch (e) {
      }
    },
    get onMessage() {
      return onMessage;
    },
    dispose(): void {
      sender.send(IPCEvent.DISCONNECT, null);
    }
  }
}






