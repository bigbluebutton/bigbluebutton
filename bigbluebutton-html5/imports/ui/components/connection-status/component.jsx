import { useEffect } from 'react';
import { useMutation, useSubscription } from '@apollo/client';
import { CONNECTION_STATUS_SUBSCRIPTION } from './queries';
import { UPDATE_CONNECTION_ALIVE_AT, UPDATE_USER_CLIENT_RESPONSE_AT } from './mutations';

const STATS_INTERVAL = Meteor.settings.public.stats.interval;

const ConnectionStatus = () => {
  const [updateUserClientResponseAtToMeAsNow] = useMutation(UPDATE_USER_CLIENT_RESPONSE_AT);

  const handleUpdateUserClientResponseAt = () => {
    updateUserClientResponseAtToMeAsNow();
  };

  const [updateConnectionAliveAtToMeAsNow] = useMutation(UPDATE_CONNECTION_ALIVE_AT);

  const handleUpdateConnectionAliveAt = () => {
    updateConnectionAliveAtToMeAsNow();

    setTimeout(() => {
      handleUpdateConnectionAliveAt();
    }, STATS_INTERVAL);
  };

  useEffect(() => {
    handleUpdateConnectionAliveAt();
  }, []);

  const { loading, error, data } = useSubscription(CONNECTION_STATUS_SUBSCRIPTION);

  if (!loading && !error && data) {
    data.user_connectionStatus.forEach((curr) => {
      if (curr.userClientResponseAt == null) {
        const delay = 500;
        setTimeout(() => {
          handleUpdateUserClientResponseAt();
        }, delay);
      }
    });
  }

  return null;
};

export default ConnectionStatus;
