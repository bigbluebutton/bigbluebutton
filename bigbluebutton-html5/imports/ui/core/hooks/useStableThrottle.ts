import { useEffect, useMemo, useRef } from 'react';
import { throttle } from '/imports/utils/throttle';

// A throttle that survives re-renders. Calling throttle() in the render body creates a new one, with
// fresh timing state, on every render, so with leading: true every call runs at once and nothing is
// throttled. This keeps one throttle per component and always runs the latest callback, so a trailing
// call never uses the state of the render that scheduled it.
const useStableThrottle = (
  callback: () => void,
  delay: number,
  { leading = true, trailing = true }: { leading?: boolean; trailing?: boolean } = {},
) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const mountedRef = useRef(false);

  const throttled = useMemo(
    () => throttle(() => {
      if (mountedRef.current) callbackRef.current();
    }, delay, { leading, trailing }),
    [delay, leading, trailing],
  );

  // A trailing call after unmount does nothing. Not cancel(): it disables the throttle for good,
  // and StrictMode runs this cleanup before mounting again.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return throttled;
};

export default useStableThrottle;
