import * as React from 'react';
import {ConnectionStatus} from '../types/socket';
import {getSocket, WrappedSocket} from '../util/socket';

type UseSocketResult = [ConnectionStatus, WrappedSocket | undefined];

export const useSocket = (): UseSocketResult => {
  const [status, setStatus] = React.useState(ConnectionStatus.OFFLINE);
  const socketRef = React.useRef<WrappedSocket>();

  React.useEffect(() => {
    const socket = getSocket();

    socket.on('open', () => {
      setStatus(ConnectionStatus.CONNECTING);
    });

    socket.on('close', () => {
      setStatus(ConnectionStatus.OFFLINE);
    });

    socket.on('message', (event) => {
      if (event.type === 'subscribed') {
        setStatus(ConnectionStatus.CONNECTED);
      }
    });

    socketRef.current = socket;
  }, []);

  return [status, socketRef.current];
};
