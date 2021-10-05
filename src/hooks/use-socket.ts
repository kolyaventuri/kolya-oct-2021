import * as React from 'react';
import {ConnectionStatus} from '../types/socket';
import {getSocket} from '../util/socket';

type UseSocketResult = [
  ConnectionStatus,
  Array<[number, number]>, // Bid
  Array<[number, number]>, // Ask
];

export const useSocket = (ticker: string): UseSocketResult => {
  const socket = React.useMemo(() => getSocket(), []);
  const [status] = React.useState(ConnectionStatus.OFFLINE);
  const [bid] = React.useState<Array<[number, number]>>([]);
  const [ask] = React.useState<Array<[number, number]>>([]);

  React.useEffect(() => {
    socket.close();
  }, [ticker, socket]);

  return [status, bid, ask];
};
