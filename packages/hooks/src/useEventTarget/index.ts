import { useState, useCallback, useRef } from 'react';

type ValueProps<T, U> = T | undefined;

interface Callback<T, U> {
  onChange: (e: EventTarget<U>) => any;
  reset: () => void;
}

interface EventTarget<U> {
  target: {
    value: U;
  }
}

interface Params<T, U> {
  initialValue?: T;
  transformer?: (value: U) => T;
}

export default <T, U = T>(parmas?: Params<T, U>): [
  ValueProps<T, U>,
  Callback<T, U>
] => {
  const { initialValue, transformer } = parmas || {};
  const [value, setValue] = useState(initialValue);

  const reset = useCallback(() => setValue(initialValue), [setValue]);

  const transformerRef = useRef(transformer);
  transformerRef.current = transformer;

  const onChange = useCallback((e: EventTarget<U>) => {
    const _value = e.target.value;
    if (typeof transformerRef.current === 'function') {
      return setValue(transformerRef.current(_value))
    }
    // no transformer => U and T should be the same
    return setValue(_value as unknown as T);
  }, [setValue]);

  return [
    value,
    {
      onChange,
      reset
    }
  ]
};
