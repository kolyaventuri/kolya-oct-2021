import {BOOK_URL} from '../constants/urls';
import {SubscribeOptions, UnsubscribeOptions} from '../types/socket';

type CallbackFn<T> = (event: T) => unknown;

export class WrappedSocket {
  private readonly __socket: WebSocket;

  constructor(url: string) {
    this.__socket = new window.WebSocket(url);
  }

  public on(event: 'open' | 'error', callback: CallbackFn<Event>): void;
  public on(event: 'close', callback: CallbackFn<CloseEvent>): void;
  public on(event: 'message', callback: CallbackFn<MessageEvent>): void;
  public on(event: string, callback: CallbackFn<any>): void {
    const handler = `on${event}`;
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
}

let socket: WrappedSocket;

export const getSocket = (): WrappedSocket => {
  if (socket) {
    return socket;
  }

  socket = new WrappedSocket(BOOK_URL);

  return socket;
};
