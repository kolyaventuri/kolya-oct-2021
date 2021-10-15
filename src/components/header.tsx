import * as React from 'react';
import cx from 'classnames';
import {ConnectionStatus} from '../types/socket';
import {Spread as SpreadType} from '../types/book';
import {Spread} from './spread';

interface HeaderProps {
  ticker: string;
  status: ConnectionStatus;
  isMobile: boolean;
  spread: SpreadType;
}

const statusColors = {
  [ConnectionStatus.OFFLINE]: 'bg-red-500',
  [ConnectionStatus.CONNECTING]: 'bg-orange-500',
  [ConnectionStatus.CONNECTED]: 'bg-green-400',
};

export const Header = ({
  ticker,
  status,
  isMobile,
  spread,
}: HeaderProps): JSX.Element => {
  return (
    <div
      data-testid="header"
      className="text-white w-full border-b-2 border-gray-700 py-1 px-2 flex-grow"
    >
      <div className="flex flex-row">
        <h1 className="font-semibold inline px-2">Order Book</h1>
        <p className="inline px-2">{ticker}</p>
        {!isMobile && <Spread data={spread} />}
        <div className={isMobile ? 'flex-grow' : ''}>
          <div className="inline float-right">
            <div
              className={cx(
                'w-4 h-4 inline-block rounded-full align-middle',
                statusColors[status],
              )}
              style={{content: ''}}
            />
            <p className="px-2 inline-block align-middle">{status}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
