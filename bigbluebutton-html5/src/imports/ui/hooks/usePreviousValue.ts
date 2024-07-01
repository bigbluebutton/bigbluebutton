import { useEffect, useRef } from 'react';

/**
 * Custom hook to get previous value. It can be used,
 * for example, to get previous props or state.
 * @param {*} value Value to be tracked
 * @returns The previous value.
 */
export const usePreviousValue = <T = unknown>(value: T) => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export default usePreviousValue;
