import * as React from 'react';

import {Book} from '../types/book';
import {WrappedSocket} from '../util/socket';

type UseBookResult = [Book, Book];

export const useBook = (
  ticker: string,
  socket: WrappedSocket,
): UseBookResult => {
  console.log(ticker, typeof socket);
  const [bids] = React.useState<Book>([]);
  const [asks] = React.useState<Book>([]);

  return [bids, asks];
};
