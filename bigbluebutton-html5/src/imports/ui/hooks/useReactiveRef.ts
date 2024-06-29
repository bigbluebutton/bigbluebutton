import { useMemo, useRef, useState } from 'react';

const CURRENT_FIELD = 'current';

const useReactiveRef = <T = unknown>(initialValue: T | null) => {
  const [current, setCurrent] = useState<T | null>(null);
  const ref = useRef<T | null>(initialValue);

  const proxy = useMemo(
    () => new Proxy(ref, {
      set(target, field, newValue, receiver) {
        if (field === CURRENT_FIELD) {
          setCurrent(newValue);
        }
        return Reflect.set(target, field, newValue, receiver);
      },
    }),
    [],
  );

  return {
    ref: proxy,
    current,
  };
};

export default useReactiveRef;
