import { useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_CONNECTION_ALIVE_AT } from './mutations';

const STATS_INTERVAL = window.meetingClientSettings.public.stats.interval;

const ConnectionStatus = () => {
  const networkRttInMs = useRef(0); // Ref to store the last rtt
  const timeoutRef = useRef(null);

  const [updateConnectionAliveAtM] = useMutation(UPDATE_CONNECTION_ALIVE_AT);

  const handleUpdateConnectionAliveAt = () => {
    const startTime = performance.now();
    updateConnectionAliveAtM({
      variables: {
        networkRttInMs: networkRttInMs.current,
      },
    }).then(() => {
      const endTime = performance.now();
      networkRttInMs.current = endTime - startTime;
    }).finally(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        handleUpdateConnectionAliveAt();
      }, STATS_INTERVAL);
    });
  };

  useEffect(() => {
    // Delay first connectionAlive to avoid high RTT misestimation
    // due to initial subscription and mutation traffic at client render
    timeoutRef.current = setTimeout(() => {
      handleUpdateConnectionAliveAt();
    }, STATS_INTERVAL / 2);
  }, []);

  return null;
};

export default ConnectionStatus;
