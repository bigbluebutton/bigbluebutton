import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import ConnectionStatusButtonComponent from './component';
import { USER_CURRENT_STATUS_SUBSCRIPTION } from '../queries';
import Auth from '/imports/ui/services/auth';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import { useStorageKey } from '/imports/ui/services/storage/hooks';

const connectionStatusButtonContainer = (props) => {
  const { data } = useDeduplicatedSubscription(USER_CURRENT_STATUS_SUBSCRIPTION, {
    variables: { userId: Auth.userID },
  });
  const myCurrentStatus = data && data.length > 0
    ? data[0].currentStatus
    : 'normal';

  const { paginationEnabled } = useSettings(SETTINGS.APPLICATION);
  const { viewParticipantsWebcams } = useSettings(SETTINGS.DATA_SAVING);
  const isGridLayout = useStorageKey('isGridEnabled');

  return (
    <ConnectionStatusButtonComponent
      myCurrentStatus={myCurrentStatus}
      paginationEnabled={paginationEnabled}
      viewParticipantsWebcams={viewParticipantsWebcams}
      isGridLayout={isGridLayout}
      {...props}
    />
  );
};

export default withTracker(() => {
  const { connected } = Meteor.status();

  return {
    connected,
  };
})(connectionStatusButtonContainer);
