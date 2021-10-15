import * as React from 'react';
import {Spread as SpreadType} from '../types/book';

interface Props {
  data: SpreadType;
}

export const Spread = ({data}: Props): JSX.Element => (
  <div className="inline">
    <p className="text-gray-400 font-semibold inline">{`Spread: ${data.value} (${data.percentage})`}</p>
  </div>
);
