import * as React from 'react';

interface Props {
  onToggle: () => void;
}

export const Footer = ({onToggle}: Props): JSX.Element => (
  <div className="w-full py-4 bg-slate text-center flex-wrap">
    <button
      type="button"
      className="bg-indigo-600 text-white px-4 py-1 rounded-md font-semibold"
      onClick={onToggle}
    >
      Toggle Feed
    </button>
  </div>
);
