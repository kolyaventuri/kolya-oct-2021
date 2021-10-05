import {BOOK_URL} from '../constants/urls';

let socket: WebSocket;

export const getSocket = (): WebSocket => {
  if (socket) {
    return socket;
  }

  socket = new window.WebSocket(BOOK_URL);

  return socket;
};
