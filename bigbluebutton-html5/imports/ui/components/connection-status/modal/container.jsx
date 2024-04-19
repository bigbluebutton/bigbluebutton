import React from 'react';
import { useSubscription } from '@apollo/client';
import { CONNECTION_STATUS_REPORT_SUBSCRIPTION } from '../queries';
import Service from '../service';
import Component from './component';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { useStreams } from '../../video-provider/video-provider-graphql/hooks';

const ConnectionStatusContainer = (props) => {
  const { data } = useSubscription(CONNECTION_STATUS_REPORT_SUBSCRIPTION);
  const connectionData = data ? Service.sortConnectionData(data.user_connectionStatusReport) : [];
  const { data: currentUser } = useCurrentUser((u) => ({ isModerator: u.isModerator }));
  const amIModerator = !!currentUser?.isModerator;
  const { streams } = useStreams();
  return (
    <Component
      connectionData={connectionData}
      amIModerator={amIModerator}
      streams={streams}
      {...props}
    />
  );
};

export default ConnectionStatusContainer;
