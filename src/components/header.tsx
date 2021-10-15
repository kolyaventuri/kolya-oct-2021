import * as React from 'react';
import {ConnectionStatus} from '../types/socket';

interface HeaderProps {
  ticker: string;
  status: ConnectionStatus;
}

export const Header = ({ticker, status}: HeaderProps): JSX.Element => {
  return (
    <div data-testid="header">
      <p>{ticker}</p>
      <p>{status}</p>
    </div>
  );
};
