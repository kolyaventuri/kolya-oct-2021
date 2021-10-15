import React from 'react';
import test from 'ava';
import {render, screen} from '@testing-library/react';
import {Spread} from '../../src/components/spread';
import {Spread as SpreadType} from '../../src/types/book';

test('<Spread/>', (t) => {
  const spread: SpreadType = {
    value: '17.0',
    percentage: '0.05%',
  };

  render(<Spread data={spread} />);

  t.not(
    screen.queryByText(`Spread: ${spread.value} (${spread.percentage})`),
    null,
  );
});
