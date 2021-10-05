import {BOOK_URL} from '../constants/urls';

export class WrappedSocket {
  private readonly __socket: WebSocket;

  constructor(url: string) {
    this.__socket = new window.WebSocket(url);
    console.log(typeof this.__socket);
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
