import { ipcRenderer } from 'electron';
import { createEventListener, Handler, Listener } from './event';
import { IdGenerator } from  './utils';
import { 
  IPCEvent, 
  createProtocol, 
  Channel,
  RawResponseListenHandler,
  MessagePassingProtocol,
  RawResponse,
  RawRequest,
  RequestType,
  RawInitializeResponse,
  ResponseType,
  IPCRequestError
} from './ipc';

function createChannelClient(protocol: MessagePassingProtocol) {
  const handlers = new Map<string, RawResponseListenHandler>();
  const listeners = new Set<Listener>();
  const idGenerator = new IdGenerator();

  let protocolListenHandler: null | Handler = protocol.onMessage.on(
    (msg: RawResponse | RawInitializeResponse): void => onRawResponse(msg)
  );
   
  function onRawResponse (response: RawResponse | RawInitializeResponse): void {
    const { type } = response;
    if (type === ResponseType.Initialize) {
      return;
    }
    onResponse(response as RawResponse);
  }

  function onResponse (response: RawResponse): void {
    const handler = handlers.get(response.id);

    if (handler) {
      handler(response);
    }
  }

  function sendRequest (request: RawRequest): void {
    protocol.send(request);
  }

  function requestPromise (channelName: string, name: string, arg?: any): Promise<any> {
    const id = idGenerator.nextId();
    const type = RequestType.Promise;
    const request: RawRequest = {
      id,
      type,
      channelName,
      name,
      arg
    };

    const result = new Promise((resolve, reject): void => {
      const handler = (response: RawResponse): void => {
        switch (response.type) {
          case ResponseType.PromiseSuccess:
            handlers.delete(id);
            resolve(response.data);
            break;
          case ResponseType.PromiseError:
            handlers.delete(id);
            const error = new IPCRequestError(response.data.message, response.data.code);
            error.name = response.data.name;
            let stack = response.data.stack;
            if (stack && typeof stack === 'object') {
              stack = stack.join('\n');
            }
            error.stack = stack;
            reject(error);
            break;
          case ResponseType.PromiseErrorObj:
            handlers.delete(id);
            reject(response.data);
            break;
        }
      };

      handlers.set(id, handler);
      sendRequest(request);
    });

    return result;
  }

  
  function getChannel (channelName: string): Channel {
    return {
      call <G>(command: string, arg?: any): Promise<G> {
        return requestPromise(channelName, command, arg);
      }
    };
  }

  function dispose (): void {
    if (protocolListenHandler) {
      protocolListenHandler.dispose();
      protocolListenHandler = null;
    }
    listeners.forEach((listener): void => {
      listener.dispose();
    });
    listeners.clear();
  }

  return {
    dispose,
    getChannel
  }
 
}


export default function createIPCClient() {
  ipcRenderer.send(IPCEvent.CONNECT);

  const onMessage = createEventListener(
    ipcRenderer, 
    IPCEvent.MESSAGE,
    (e: Electron.Event, msg: any): any => [msg]
  );
  const protocol = createProtocol(ipcRenderer, onMessage);
  const channelClient = createChannelClient(protocol);

  return {
    getChannel (channelName: string): Channel {
      return channelClient.getChannel(channelName);
    },
  
    dispose(): void {
      channelClient.dispose();
    }
  }
}
