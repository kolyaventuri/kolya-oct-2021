import React from 'react';
import test from 'ava';
import {shallow} from 'enzyme';

import Home from '../../src/pages';

const getComponent = () => shallow(<Home />);

test('renders a head component', (t) => {
  const tree = getComponent();

  t.is(tree.find('Head').length, 1);
});

test('renders an order book', (t) => {
  const tree = getComponent();

  t.is(tree.find('OrderBook').length, 1);
});
