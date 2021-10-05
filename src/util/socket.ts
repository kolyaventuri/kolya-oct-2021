import {BOOK_URL} from '../constants/urls';
import {SubscribeOptions, UnsubscribeOptions} from '../types/socket';

type CallbackFn<T> = (event: T) => unknown;
const events = ['open', 'error', 'close', 'message'] as const;
type EventType = typeof events[number];

const enum ReadyState {
  CONNECTING,
  OPEN,
  CLOSING,
  CLOSED,
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
  public on(event: 'message', callback: CallbackFn<MessageEvent>): void;
  public on(event: EventType, callback: CallbackFn<any>): void {
    const handler = `on${event}`;
    this.__handlers[event] = callback;
    this.__socket[handler] = callback;
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
