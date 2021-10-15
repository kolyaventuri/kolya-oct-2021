import * as React from 'react';

interface Props {
  onToggle: () => void;
}

export const Footer = ({onToggle}: Props): JSX.Element => (
  <div className="w-full border-t-2 border-gray-800 py-4 bg-slate text-center">
    <button
      type="button"
      className="bg-indigo-600 text-white px-4 py-1 rounded-md font-semibold"
      onClick={onToggle}
    >
      Toggle Feed
    </button>
  </div>
);
