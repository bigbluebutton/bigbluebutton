import { useEffect, useRef } from 'react';

/**
 * Custom hook to get previous value. It can be used,
 * for example, to get previous props or state.
 * @param {*} value 
 * @returns The previous value.
 */
export const usePreviousValue = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export default {
  usePreviousValue,
};
