import React from 'react';
import { useReactiveVar } from '@apollo/client';
import { CONNECTION_STATUS_REPORT_SUBSCRIPTION } from '../queries';
import {
  sortConnectionData,
} from '../service';
import Component from './component';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import connectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';

const ConnectionStatusContainer = (props) => {
  const { data } = useDeduplicatedSubscription(CONNECTION_STATUS_REPORT_SUBSCRIPTION);
  const connectionData = data ? sortConnectionData(data.user_connectionStatusReport) : [];
  const { data: currentUser } = useCurrentUser((u) => ({ isModerator: u.isModerator }));
  const amIModerator = !!currentUser?.isModerator;

  const networkData = useReactiveVar(connectionStatus.getNetworkDataVar());

  return (
    <Component
      {...props}
      connectionData={connectionData}
      amIModerator={amIModerator}
      networkData={networkData}
    />
  );
};

export default ConnectionStatusContainer;
