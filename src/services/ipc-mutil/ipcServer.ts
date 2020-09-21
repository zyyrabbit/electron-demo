import { ipcMain } from 'electron';
import { createEventListener, Handler } from './event';
import { 
  IPCEvent, 
  Channel, 
  createProtocol,
  MessagePassingProtocol,
  RequestType,
  PendingRequest,
  RawRequest,
  ResponseType,
  RawNoticeRequest,
  RawPromiseRequest,
  RawEventListenRequest,
  RawResponse,
  RawInitializeResponse
} from './ipc';

interface ChannelServer {
  registerChannel (channelName: string, channel: Channel): void
  dispose (): void
}

interface Connection {
	readonly channelServer: ChannelServer
}

export function createChannelServer(protocol: MessagePassingProtocol, timeout: number = 100) {
  const channels = new Map<string, Channel>();
  const eventHandlers = new Map<string, Handler>();
  const pendingRequests = new Map<string, PendingRequest[]>();
  const timeoutDelay: number = timeout;

  let protocolListenHandler: null | Handler = protocol.onMessage.on((msg: RawRequest): void => onRawMessage(msg));

  sendResponse({ type: ResponseType.Initialize });

  function onRawMessage (message: RawRequest): void {
    const { type } = message;
    switch (type) {
      case RequestType.Promise:
        onPromise(message as RawPromiseRequest);
    }
  }

  async function onPromise (request: RawPromiseRequest): Promise<void> {
    const { channelName, id } = request;
    const channel = channels.get(channelName);
    if (!channel) {
      collectPendingRequest(request);
      return;
    }
    try {
      const data = await channel.call(request.name, request.arg);
      sendResponse({
        id,
        data,
        type: ResponseType.PromiseSuccess
      });
    } catch(error) {
      if (error instanceof Error) {
        sendResponse({
          id,
          data: {
            message: error.message,
            code: (error as any).code,
            name: error.name,
            stack: error.stack ? (error.stack.split ? error.stack.split('\n') : error.stack) : undefined
          },
          type: ResponseType.PromiseError
        });
      }
    }
  }

  function sendResponse (response: RawResponse | RawInitializeResponse): void {
    send(response);
  }

  function send(message: RawResponse | RawInitializeResponse): void {
    try {
      protocol.send(message);
    } catch (err) {

    }
  }

  function collectPendingRequest (request: RawEventListenRequest | RawPromiseRequest | RawNoticeRequest): void {
    let { channelName } = request;
    let pendingRequest = pendingRequests.get(channelName);

    if (!pendingRequest) {
      pendingRequest = [];
      pendingRequests.set(channelName, pendingRequest);
    }

    const timer = setTimeout((): void => {
			console.error(`Unknown channel: ${request.channelName}`);

			if (request.type === RequestType.Promise) {
				sendResponse({
					id: request.id,
          data: { 
            name: 'Unknown channel', 
            message: `Channel name '${request.channelName}' timed out after ${timeoutDelay}ms`, 
            stack: undefined 
          },
					type: ResponseType.PromiseError
				});
			}
		}, timeoutDelay);

		pendingRequest.push({ request, timeoutTimer: timer });
  }

  function flushPendingRequests (channelName: string): void {
		const requests = pendingRequests.get(channelName);

		if (requests) {
			for (const request of requests) {
				clearTimeout(request.timeoutTimer);

				switch (request.request.type) {
          case RequestType.Promise:
            onPromise(request.request);
            break;
				}
      }
			pendingRequests.delete(channelName);
		}
  }
  
  
  function registerChannel (channelName: string, channel: Channel): void {
    channels.set(channelName, channel);
    setTimeout((): void => {
      flushPendingRequests(channelName);
    }, 0);
  }


  function dispose (): void {
    if (protocolListenHandler) {
      protocolListenHandler.dispose();
     protocolListenHandler = null;
    }
    eventHandlers.forEach((handler): void => handler.dispose());
    eventHandlers.clear();
  }

  return {
    registerChannel,
    dispose
  }
}


export function createIPCServer() {
  const channels = new Map<string, Channel>();
  const connections = new Map<number, Connection>();

 
  ipcMain.on(IPCEvent.CONNECT, (e: Electron.IpcMainEvent): void => onConnect(e.sender));
  ipcMain.on(IPCEvent.DISCONNECT, (e: Electron.IpcMainEvent): void => onDisconnect(e.sender));
  

  function onConnect (sender: Electron.WebContents): void {
    const id = sender.id;

    if (connections.get(id)) {
      disconnect(id);
    }

    const onMessage = createEventListener(
      ipcMain, 
      IPCEvent.MESSAGE,
      (event: Electron.IpcMainEvent, msg: any): any[] => [msg],
      (event: Electron.IpcMainEvent): boolean => event.sender.id === id,
    );
    const protocol = createProtocol(sender, onMessage);
    const channelServer = createChannelServer(protocol);

    channels.forEach((channel, name): void => {
      channelServer.registerChannel(name, channel);
    });

    const connection: Connection = {
      channelServer
    };

    connections.set(id, connection);
  }

  function onDisconnect (sender: Electron.WebContents): void {
    disconnect(sender.id);
  }

  function disconnect (id: number): void {
    const connection = connections.get(id);
    if (connection) {
      connection.channelServer.dispose();
      connections.delete(id);
    }
  }

  function registerChannel (channelName: string, channel: Channel): void {
    channels.set(channelName, channel);
  }

  function dispose (): void {
    connections.forEach((connection, id): void => {
      disconnect(id);
    });
  }

  return {
    registerChannel,
    dispose
  }
}
