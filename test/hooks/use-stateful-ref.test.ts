import test from 'ava';
import {act, renderHook} from '@testing-library/react-hooks';
import {useStatefulRef} from '../../src/hooks/use-stateful-ref';

test('#useStatefulRef stores a value in both value and ref', (t) => {
  const initial = 'some type';
  const {result} = renderHook(() => useStatefulRef(initial));
  const [value, , ref] = result.current;

  t.is(value, initial);
  t.is(ref.current, initial);
});

test('#useStatefulRef updates both ref and value if setValue is called', (t) => {
  const initial = 'some type';
  const newValue = 'new value';
  const {result} = renderHook(() => useStatefulRef(initial));
  const [, setValue] = result.current;

  act(() => {
    setValue(newValue);
  });

  t.is(result.current[0], newValue);
  t.is(result.current[2].current, newValue);
});
