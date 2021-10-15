import browserEnv from 'browser-env';
import {stub} from 'sinon';

browserEnv();

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: stub().returns({
    matches: false,
  }),
});
