import * as React from 'react';

interface Props {
  onReconnectClick: () => void;
}

export const DisconnectOverlay = ({onReconnectClick}: Props): JSX.Element => (
  <div
    data-testid="dc-overlay"
    className="w-screen h-screen absolute top-0 left-0 z-10 bg-opacity-80 bg-slate"
  >
    <div className="flex h-full w-full items-center justify-center text-white">
      <div className="text-center">
        <p className="p-5">
          You have disconnected. Press the button below to reconnect.
        </p>
        <button
          type="button"
          className="px-4 py-1 bg-indigo-600 font-semibold"
          onClick={onReconnectClick}
        >
          Reconnect
        </button>
      </div>
    </div>
  </div>
);
