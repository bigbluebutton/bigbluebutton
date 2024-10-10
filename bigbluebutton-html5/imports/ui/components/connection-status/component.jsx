import { useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_CONNECTION_ALIVE_AT } from './mutations';
import {
  getStatus,
  handleAudioStatsEvent,
} from '/imports/ui/components/connection-status/service';
import connectionStatus from '../../core/graphql/singletons/connectionStatus';

import getBaseUrl from '/imports/ui/core/utils/getBaseUrl';
import useCurrentUser from '../../core/hooks/useCurrentUser';

const ConnectionStatus = () => {
  const STATS_INTERVAL = window.meetingClientSettings.public.stats.interval;
  const networkRttInMs = useRef(0); // Ref to store the last rtt
  const timeoutRef = useRef(null);

  const [updateConnectionAliveAtM] = useMutation(UPDATE_CONNECTION_ALIVE_AT);

  const {
    data,
  } = useCurrentUser((u) => ({
    userId: u.userId,
    avatar: u.avatar,
    isModerator: u.isModerator,
    color: u.color,
    currentlyInMeeting: u.currentlyInMeeting,
  }));

  const handleUpdateConnectionAliveAt = () => {
    const startTime = performance.now();
    fetch(
      `${getBaseUrl()}/ping`,
      { signal: AbortSignal.timeout(STATS_INTERVAL) },
    )
      .then((res) => {
        if (res.ok && res.status === 200) {
          const rttLevels = window.meetingClientSettings.public.stats.rtt;
          const endTime = performance.now();
          const networkRtt = Math.round(endTime - startTime);
          networkRttInMs.current = networkRtt;
          updateConnectionAliveAtM({
            variables: {
              networkRttInMs: networkRtt,
            },
          });
          const rttStatus = getStatus(rttLevels, networkRtt);
          connectionStatus.setRttValue(networkRtt);
          connectionStatus.setRttStatus(rttStatus);
          connectionStatus.setLastRttRequestSuccess(true);

          if (Object.keys(rttLevels).includes(rttStatus)) {
            connectionStatus.addUserNetworkHistory(
              data,
              rttStatus,
              Date.now(),
            );
          }
        }
      })
      .catch(() => {
        connectionStatus.setLastRttRequestSuccess(false);
        // gets the worst status
        connectionStatus.setRttStatus('critical');
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
      // This will generate metrics usage to determine alert statuses based
      // on WebRTC stats
      window.addEventListener('audiostats', handleAudioStatsEvent);
    }

    return () => {
      window.removeEventListener('audiostats', handleAudioStatsEvent);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return null;
};

export default ConnectionStatus;
