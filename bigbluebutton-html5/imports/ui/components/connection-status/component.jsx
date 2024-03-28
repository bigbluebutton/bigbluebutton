import { useEffect, useRef } from 'react';
import { useMutation, useSubscription } from '@apollo/client';
import { CONNECTION_STATUS_SUBSCRIPTION } from './queries';
import { UPDATE_CONNECTION_ALIVE_AT, UPDATE_USER_CLIENT_RTT } from './mutations';

const STATS_INTERVAL = window.meetingClientSettings.public.stats.interval;

const ConnectionStatus = () => {
  const networkRttInMs = useRef(null); // Ref to store the current timeout
  const lastStatusUpdatedAtReceived = useRef(null); // Ref to store the current timeout
  const timeoutRef = useRef(null);

  const [updateUserClientRtt] = useMutation(UPDATE_USER_CLIENT_RTT);

  const handleUpdateUserClientResponseAt = () => {
    updateUserClientRtt({
      variables: {
        networkRttInMs: networkRttInMs.current,
      },
    });
  };

  const [updateConnectionAliveAtToMeAsNow] = useMutation(UPDATE_CONNECTION_ALIVE_AT);

  const handleUpdateConnectionAliveAt = () => {
    const startTime = performance.now();
    updateConnectionAliveAtToMeAsNow().then(() => {
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
    handleUpdateConnectionAliveAt();
  }, []);

  const { loading, error, data } = useSubscription(CONNECTION_STATUS_SUBSCRIPTION);

  useEffect(() => {
    if (!loading && !error && data) {
      data.user_connectionStatus.forEach((curr) => {
        if (curr.connectionAliveAt != null
            && curr.userClientResponseAt == null
            && (curr.statusUpdatedAt == null
                || curr.statusUpdatedAt !== lastStatusUpdatedAtReceived.current
            )
        ) {
          lastStatusUpdatedAtReceived.current = curr.statusUpdatedAt;
          handleUpdateUserClientResponseAt();
        }
      });
    }
  }, [data]);

  return null;
};

export default ConnectionStatus;
