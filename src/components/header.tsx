import * as React from 'react';

interface HeaderProps {
  ticker: string;
}

export const Header = ({ticker}: HeaderProps): JSX.Element => {
  return (
    <div>
      <p>{ticker}</p>
    </div>
  );
};
