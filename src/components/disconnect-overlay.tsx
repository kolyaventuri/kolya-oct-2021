import * as React from 'react';

interface Props {
  onReconnectClick: () => void;
}

export const DisconnectOverlay = ({onReconnectClick}: Props): JSX.Element => (
  <div data-testid="dc-overlay">
    <button type="button" onClick={onReconnectClick}>
      Reconnect
    </button>
  </div>
);
