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

interface DataMessage {
  type: 'data';
  payload: {
    bid: Array<[number, number]>;
    ask: Array<[number, number]>;
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
  private readonly __handlers: {[key in EventType]?: CallbackFn<any>} = {};

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
            payload = {
              bids: data.bids,
              asks: data.asks,
            };
          }
        } catch {}

        callback({
          type,
          payload,
        });
      };
    }

    this.__handlers[event] = fn;
    this.__socket[handler] = fn;
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
    for (const [event, callback] of Object.entries(this.__handlers)) {
      // @ts-expect-error - Event can only be one of EventType
      // TODO: Resolve this type if possible
      this.on(event, callback);
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
