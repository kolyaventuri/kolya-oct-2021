export const useMemo = (factory: () => any, _dependencies: any[]): any =>
  factory();

export const useState = <T = any>(
  initialValue: T,
): [T, (newValue: T) => void] => {
  let value = initialValue;
  const setValue = (newValue: T) => {
    value = newValue;
  };

  return [value, setValue];
};

export const useEffect = (callback: () => void): void => {
  callback();
};
