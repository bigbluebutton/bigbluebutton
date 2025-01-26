import React from 'react';
import { useReactiveVar } from '@apollo/client';
import ConnectionStatusButtonComponent from './component';
import connectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';
import { getWorstStatus, LOG_MEDIA_STATS } from '../service';

const ConnectionStatusButtonContainer = (props) => {
  const connected = useReactiveVar(connectionStatus.getConnectedStatusVar());
  const rttStatus = useReactiveVar(connectionStatus.getRttStatusVar());
  const liveKitStatus = useReactiveVar(connectionStatus.getLiveKitConnectionStatusVar());
  const packetLossStatus = useReactiveVar(connectionStatus.getPacketLossStatusVar());

  const myCurrentStatus = getWorstStatus([
    rttStatus,
    packetLossStatus,
    liveKitStatus,
  ]);

  return (
    <ConnectionStatusButtonComponent
      myCurrentStatus={myCurrentStatus}
      connected={connected}
      logMediaStats={LOG_MEDIA_STATS()}
      {...props}
    />
  );
};

export default ConnectionStatusButtonContainer;
