import React from 'react';
import { useReactiveVar } from '@apollo/client';
import ConnectionStatusButtonComponent from './component';
import connectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';
import { getWorstStatus } from '../service';

const ConnectionStatusButtonContainer = (props) => {
  const connected = useReactiveVar(connectionStatus.getConnectedStatusVar());
  const rttStatus = useReactiveVar(connectionStatus.getRttStatusVar());
  const jitterStatus = useReactiveVar(connectionStatus.getJitterStatusVar());
  const packetLossStatus = useReactiveVar(connectionStatus.getPacketLossStatusVar());

  const myCurrentStatus = getWorstStatus([rttStatus, jitterStatus, packetLossStatus]);

  return (
    <ConnectionStatusButtonComponent
      myCurrentStatus={myCurrentStatus}
      connected={connected}
      {...props}
    />
  );
};

export default ConnectionStatusButtonContainer;
