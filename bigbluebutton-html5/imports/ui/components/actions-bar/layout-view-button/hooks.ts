import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import logger from '/imports/startup/client/logger';
import { throttle } from '/imports/utils/throttle';

const REQUEST_THROTTLE_TIME = 300;
// How long the requested value is shown after the server accepts it without reporting it back.
const PENDING_VALUE_TIMEOUT = 2000;

// Returns the value this user last requested until the subscription catches up. Quick
// consecutive changes then build on each other, not on a stale server value.
export const usePendingRequest = <T extends boolean | number>(
  serverValue: T,
  send: (value: T) => Promise<unknown>,
  name: string,
  logCode: string,
): [T, (value: T) => void] => {
  const [pendingValue, setPendingValue] = useState<T | null>(null);
  const requestedValue = useRef<T>(serverValue);
  const pendingTimeout = useRef<ReturnType<typeof setTimeout>>();
  const sendRef = useRef(send);
  sendRef.current = send;

  // Throttled like the mute toggle; reads the ref so the trailing call sends the latest value.
  const sendRequestedValue = useMemo(() => throttle(() => {
    const value = requestedValue.current;
    clearTimeout(pendingTimeout.current);
    sendRef.current(value).then(() => {
      // The subscription may never report the requested value: a quick on/off can reach the
      // client as no change at all. Fall back to the server value so the control can't get stuck.
      clearTimeout(pendingTimeout.current);
      pendingTimeout.current = setTimeout(() => setPendingValue(null), PENDING_VALUE_TIMEOUT);
    }).catch((error) => {
      logger.error({
        logCode,
        extraInfo: { value, errorMessage: error?.message },
      }, `Failed to set ${name} to ${value}: ${error?.message}`);
      setPendingValue(null);
    });
  }, REQUEST_THROTTLE_TIME), [name, logCode]);

  useEffect(() => () => {
    sendRequestedValue.cancel();
    clearTimeout(pendingTimeout.current);
  }, [sendRequestedValue]);

  // Only a server change can settle the request, so intermediate echoes don't flicker.
  useEffect(() => {
    setPendingValue((pending) => (pending === serverValue ? null : pending));
  }, [serverValue]);

  const request = useCallback((value: T) => {
    requestedValue.current = value;
    clearTimeout(pendingTimeout.current);
    setPendingValue(value);
    sendRequestedValue();
  }, [sendRequestedValue]);

  return [pendingValue ?? serverValue, request];
};

export default usePendingRequest;
