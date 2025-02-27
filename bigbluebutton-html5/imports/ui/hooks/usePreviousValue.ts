import { useEffect, useRef, useState } from 'react';

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

/**
 * Custom hook to get previous value with state. It can be used,
 * for example, to get previous props or state. So that every time it changes,
 * it will force another render.
 * @param {*} value Value to be tracked
 * @returns The previous value.
 */
export const useStatePreviousValue = <T = unknown>(value: T) => {
  const [state, setState] = useState<T>();
  useEffect(() => {
    setState(value);
  });
  return state;
};

export default usePreviousValue;
