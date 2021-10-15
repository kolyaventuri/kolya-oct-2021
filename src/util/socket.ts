import {BOOK_URL} from '../constants/urls';
import {SubscribeOptions, UnsubscribeOptions} from '../types/socket';

type CallbackFn<T> = (event: T) => unknown;
type EventType = 'open' | 'error' | 'close' | 'message';
type MessageType = 'subscribed' | 'data' | 'generic';

const enum ReadyState {
  CONNECTING,
  OPEN,
  CLOSING,
  CLOSED,
}

interface BaseSocketMessage {
  type: MessageType;
  payload: any;
}

interface SubscribedMessage {
  type: 'subscribed';
  payload?: never;
}

export interface DataMessage {
  type: 'data';
  payload: {
    bids: Array<[number, number]>;
    asks: Array<[number, number]>;
  };
}

type SocketMessage = BaseSocketMessage | SubscribedMessage | DataMessage;

interface EventData {
  [key: string]: unknown;
  event?: string;
  feed?: string;
}

export class WrappedSocket {
  private __socket: WebSocket;
  private readonly __url: string;
  private readonly __handlers: {
    [key in EventType]?: Array<CallbackFn<any>>;
  } = {};

  constructor(url: string) {
    this.__url = url;
    this.__socket = new window.WebSocket(url);
    this.open();
  }

  public on(event: 'open' | 'error', callback: CallbackFn<Event>): void;
  public on(event: 'close', callback: CallbackFn<CloseEvent>): void;
  public on(event: 'message', callback: CallbackFn<SocketMessage>): void;
  public on(event: EventType, callback: CallbackFn<any>): void {
    const handler = `on${event}`;

    let fn = callback;
    if (event === 'message') {
      fn = (event: MessageEvent) => {
        let type: MessageType = 'generic';
        let payload: unknown = event.data;

        try {
          const data = JSON.parse(event.data) as EventData;
          payload = data;

          if (data.event === 'subscribed') {
            callback({type: 'subscribed'});
            return;
          }

          // (kolyaventuri): Quick and dirty way to detect a delta / update
          const isDelta = data.feed && data.bids && data.asks && !data.event;
          if (data.feed?.endsWith('_snapshot') || isDelta) {
            type = 'data';
            const newPayload: DataMessage['payload'] = {
              bids: data.bids as DataMessage['payload']['bids'],
              asks: data.asks as DataMessage['payload']['asks'],
            };

            payload = newPayload;
          }
        } catch {}

        callback({
          type,
          payload,
        });
      };
    }

    if (!this.__handlers[event]) {
      this.__handlers[event] = [];
    }

    this.__handlers[event]?.push(fn);
    this.__socket[handler] = (payload: any) => {
      this.__runHandler(event, payload);
    };

    if (event === 'open' && this.isOpen) {
      // Emit the open handler immediately if the socket is already open
      this.__runHandler('open', undefined);
    }
  }

  public send(event: 'subscribe', options: SubscribeOptions): void;
  public send(event: 'unsubscribe', options: UnsubscribeOptions): void;
  public send(event: string, options: Record<string, any>): void {
    const eventString = JSON.stringify({
      event,
      ...options,
    });
    this.__socket.send(eventString);
  }

  public close(): void {
    this.__socket.close();
  }

  public open(): void {
    if (this.__socket.readyState !== ReadyState.CLOSED) {
      return;
    }

    this.__socket = new window.WebSocket(this.__url);

    // Reset all handlers, as they will be re-bound to the new socket
    const handlers = Object.entries(this.__handlers).slice(); // Fast deep copy
    for (const name in this.__handlers) {
      if (this.__handlers[name]) {
        this.__handlers[name] = [];
      }
    }

    for (const [event, callbackArray] of handlers) {
      for (const callback of callbackArray) {
        // @ts-expect-error - Event can only be one of EventType
        // TODO: Resolve this type if possible
        this.on(event, callback);
      }
    }
  }

  public get isOpen(): boolean {
    return this.__socket.readyState === ReadyState.OPEN;
  }

  private __runHandler(handler: string, payload: any): void {
    const handlerFns = this.__handlers[handler] as Array<CallbackFn<any>>;

    for (const fn of handlerFns) {
      fn(payload);
    }
  }
}

let socket: WrappedSocket;

export const getSocket = (): WrappedSocket => {
  if (socket) {
    return socket;
  }

  socket = new WrappedSocket(BOOK_URL);

  return socket;
};
