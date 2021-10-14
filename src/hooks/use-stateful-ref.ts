// https://stackoverflow.com/a/58439475/3685123
/*
 * useStatefulRef leans on React.useRef to allow for deeper state access, via event handlers.
 * Standard React.useState will not update properly.
 */

import * as React from 'react';

type HookResult<T> = [
  T,
  React.Dispatch<React.SetStateAction<T>>,
  React.MutableRefObject<T>,
];

export const useStatefulRef = <T>(initialValue: T): HookResult<T> => {
  const [value, setValue] = React.useState<T>(initialValue);
  const ref = React.useRef<T>(initialValue);

  React.useEffect(() => {
    ref.current = value;
  }, [value]);

  return [value, setValue, ref];
};
