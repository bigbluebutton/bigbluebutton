import React from 'react';
import { CONNECTION_STATUS_REPORT_SUBSCRIPTION } from '../queries';
import Service from '../service';
import Component from './component';
import useCurrentUser from 'imports/ui/core/hooks/useCurrentUser';
import { useGetStats } from '../../video-provider/hooks';
import useDeduplicatedSubscription from 'imports/ui/core/hooks/useDeduplicatedSubscription';

const ConnectionStatusContainer = (props) => {
  const { data } = useDeduplicatedSubscription(CONNECTION_STATUS_REPORT_SUBSCRIPTION);
  const connectionData = data ? Service.sortConnectionData(data.user_connectionStatusReport) : [];
  const { data: currentUser } = useCurrentUser((u) => ({ isModerator: u.isModerator }));
  const amIModerator = !!currentUser?.isModerator;
  const { isGridLayout, paginationsEnabled, viewParticipantsWebcams } = props;
  const getVideoStreamsStats = useGetStats(
    isGridLayout,
    paginationsEnabled,
    viewParticipantsWebcams,
  );
  return (
    <Component
      connectionData={connectionData}
      amIModerator={amIModerator}
      getVideoStreamsStats={getVideoStreamsStats}
      {...props}
    />
  );
};

export default ConnectionStatusContainer;
