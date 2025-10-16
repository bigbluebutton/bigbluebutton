import logger from '/imports/startup/client/logger';
import getBaseUrl from '/imports/ui/core/utils/getBaseUrl';

const TIMER_SYNC_TIMEOUT = 5000;

/*
  Fetch the server time and calculate the time offset between client and server.
  The time offset is the difference between the server time and the client time,
  adjusted by the network round-trip time (RTT) divided by 2.

  The function returns the time offset in milliseconds.
*/
export async function fetchTimeOffset(): Promise<number> {
  const clientSend = performance.now();
  const fetchOptions = {
    signal: AbortSignal.timeout ? AbortSignal.timeout(TIMER_SYNC_TIMEOUT) : undefined,
  };
  return fetch(
    `${getBaseUrl()}/rtt-check`,
    fetchOptions,
  ).then((res) => {
    const clientReceive = performance.now();
    if (res.ok && res.status === 200) {
      const networkRtt = Math.round(clientReceive - clientSend);
      const delay = networkRtt / 2;
      if (res.headers.get('X-Server-Epoch-Msec') === null) {
        throw new Error('Invalid server time response. Header X-Server-Epoch-Msec is missing.');
      }

      const serverTime = Number(res.headers.get('X-Server-Epoch-Msec'));
      // Performance now returns a relative time since the page load in milliseconds
      // We need to convert it to an absolute time in milliseconds since the epoch
      // by adding the time origin (the time when the page started to load)
      // see https://developer.mozilla.org/en-US/docs/Web/API/Performance/timeOrigin
      const epochClientSend = performance.timeOrigin + clientSend;
      return (serverTime * 1000) - (epochClientSend + delay);
    }
    throw new Error(`Invalid server time response. Status: ${res.status}`);
  }).catch((error) => {
    logger.error({
      logCode: 'error_during_time_offset_fetch',
    }, `Error: ${error.message}. Assuming time offset to be 0`);
    return 0;
  });
}

export default {
  fetchTimeOffset,
};
