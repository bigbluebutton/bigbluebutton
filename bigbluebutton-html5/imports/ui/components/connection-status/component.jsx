import { useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_CONNECTION_ALIVE_AT } from './mutations';
import { getStatus, handleAudioStatsEvent, startMonitoringNetwork } from '/imports/ui/components/connection-status/service';
import connectionStatus from '../../core/graphql/singletons/connectionStatus';
import useSettings from '../../services/settings/hooks/useSettings';
import { SETTINGS } from '../../services/settings/enums';
import { useStorageKey } from '../../services/storage/hooks';
import { useGetStats } from '../video-provider/hooks';

const ConnectionStatus = () => {
  const STATS_INTERVAL = window.meetingClientSettings.public.stats.interval;
  const networkRttInMs = useRef(0); // Ref to store the last rtt
  const timeoutRef = useRef(null);

  const [updateConnectionAliveAtM] = useMutation(UPDATE_CONNECTION_ALIVE_AT);

  const { paginationEnabled } = useSettings(SETTINGS.APPLICATION);
  const { viewParticipantsWebcams } = useSettings(SETTINGS.DATA_SAVING);
  const isGridLayout = useStorageKey('isGridEnabled');

  const getVideoStreamsStats = useGetStats(
    isGridLayout,
    paginationEnabled,
    viewParticipantsWebcams,
  );

  const handleUpdateConnectionAliveAt = () => {
    const startTime = performance.now();
    fetch(
      `${window.location.host}/bigbluebutton/ping`,
      { signal: AbortSignal.timeout(STATS_INTERVAL) },
    )
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
          connectionStatus.setRttValue(networkRtt);
          connectionStatus.setRttStatus(rttStatus);
          connectionStatus.setLastRttRequestSuccess(true);
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
      window.addEventListener('audiostats', handleAudioStatsEvent);
      startMonitoringNetwork(getVideoStreamsStats);
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
