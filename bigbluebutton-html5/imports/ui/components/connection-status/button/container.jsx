import React from 'react';
import ConnectionStatusButtonComponent from './component';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import { useStorageKey } from '/imports/ui/services/storage/hooks';
import { useReactiveVar } from '@apollo/client';
import connectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';

const ConnectionStatusButtonContainer = (props) => {
  const connected = useReactiveVar(connectionStatus.getConnectedStatusVar());

  const myCurrentStatus = useReactiveVar(connectionStatus.getRttStatusVar());

  const { paginationEnabled } = useSettings(SETTINGS.APPLICATION);
  const { viewParticipantsWebcams } = useSettings(SETTINGS.DATA_SAVING);
  const isGridLayout = useStorageKey('isGridEnabled');

  return (
    <ConnectionStatusButtonComponent
      myCurrentStatus={myCurrentStatus}
      paginationEnabled={paginationEnabled}
      viewParticipantsWebcams={viewParticipantsWebcams}
      isGridLayout={isGridLayout}
      connected={connected}
      {...props}
    />
  );
};

export default ConnectionStatusButtonContainer;
