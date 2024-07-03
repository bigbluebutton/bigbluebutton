import { useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_CONNECTION_ALIVE_AT } from './mutations';
import { handleAudioStatsEvent } from '/imports/ui/components/connection-status/service';
import connectionStatus from '../../core/graphql/singletons/connectionStatus';

function getStatus(levels, value) {
  const sortedLevels = Object.keys(levels).map(Number).sort((a, b) => a - b);
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < sortedLevels.length; i++) {
    if (value < sortedLevels[i]) {
      return i === 0 ? 'normal' : levels[sortedLevels[i - 1]];
    }

    if (i === sortedLevels.length - 1) {
      return levels[sortedLevels[i]];
    }
  }

  return levels[sortedLevels[sortedLevels.length - 1]];
}

const ConnectionStatus = () => {
  const networkRttInMs = useRef(0); // Ref to store the last rtt
  const timeoutRef = useRef(null);

  const [updateConnectionAliveAtM] = useMutation(UPDATE_CONNECTION_ALIVE_AT);

  const STATS_INTERVAL = window.meetingClientSettings.public.stats.interval;

  const handleUpdateConnectionAliveAt = () => {
    const startTime = performance.now();
    fetch(`${window.location.host}/bigbluebutton/ping`)
      .then((res) => {
        if (res.ok && res.status === 200) {
          const rttLevels = window.meetingClientSettings.public.stats.rtt;
          const endTime = performance.now();
          const networkRtt = endTime - startTime;
          networkRttInMs.current = networkRtt;
          updateConnectionAliveAtM({
            variables: {
              networkRttInMs: networkRtt,
            },
          });
          const rttStatus = getStatus(rttLevels, networkRtt);
          connectionStatus.setRttStatus(rttStatus);
          connectionStatus.setLastRttRequestSuccess(true);
        }
      })
      .catch(() => {
        const rttLevels = window.meetingClientSettings.public.stats.rtt;
        connectionStatus.setLastRttRequestSuccess(false);
        // gets the worst status
        connectionStatus.setRttStatus(rttLevels[Object.keys(rttLevels).sort((a, b) => b - a)]);
      })
      .finally(() => {
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

    const STATS_ENABLED = window.meetingClientSettings.public.stats.enabled;

    if (STATS_ENABLED) {
      window.addEventListener('audiostats', handleAudioStatsEvent);
    }

    return () => {
      if (STATS_ENABLED) {
        window.removeEventListener('audiostats', handleAudioStatsEvent);
      }
    };
  }, []);

  return null;
};

export default ConnectionStatus;
