import { useEffect, useRef } from 'react';

/**
 * Custom hook to get previous values. It can be used, for example,
 * to retrieve previous props or state.
 * @param {*} value
 * @returns The previous value.
 */
export const usePreviousValue = (value) => {
  const ref = useRef(null);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export default {
  usePreviousValue,
};
