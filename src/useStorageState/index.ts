import { useState } from 'react';

function useStorageState<T>(storage: Storage, key: string, defaultValue?: T | (() => T)) {
  const [state, setState] = useState<T | undefined>(() => {
    const raw = storage.getItem(key);
    if (raw !== null) {
      return JSON.parse(raw);
    }
    if (typeof defaultValue === 'function') {
      return (defaultValue as () => T)();
    }
    return defaultValue;
  });
  function updateState(value?: T | ((previousState: T) => T)) {
    if (typeof value === 'undefined') {
      storage.removeItem(key);
      setState(defaultValue);
    } else if (typeof value === 'function') {
      const raw = storage.getItem(key);
      const previousState = raw !== null ? JSON.parse(raw) : defaultValue;
      const currentState = (value as (previousState: T) => T)(previousState);
      storage.setItem(key, JSON.stringify(currentState));
      setState(currentState);
    } else {
      storage.setItem(key, JSON.stringify(value));
      setState(value);
    }
  }
  return [state, updateState];
}

export default useStorageState;
