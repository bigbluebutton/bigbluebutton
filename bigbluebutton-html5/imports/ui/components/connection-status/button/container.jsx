import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { useSubscription } from '@apollo/client';
import ConnectionStatusButtonComponent from './component';
import { USER_CURRENT_STATUS_SUBSCRIPTION } from '../queries';
import Auth from '/imports/ui/services/auth';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';

const connectionStatusButtonContainer = (props) => {
  const { data } = useSubscription(USER_CURRENT_STATUS_SUBSCRIPTION, {
    variables: { userId: Auth.userID },
  });
  const myCurrentStatus = data && data.length > 0
    ? data[0].currentStatus
    : 'normal';

  const { paginationEnabled } = useSettings(SETTINGS.APPLICATION);
  const { viewParticipantsWebcams } = useSettings(SETTINGS.DATA_SAVING);

  return (
    <ConnectionStatusButtonComponent
      myCurrentStatus={myCurrentStatus}
      paginationEnabled={paginationEnabled}
      viewParticipantsWebcams={viewParticipantsWebcams}
      {...props}
    />
  );
};

export default withTracker(() => {
  const { connected } = Meteor.status();
  const isGridLayout = Session.get('isGridEnabled');

  return {
    connected,
    isGridLayout,
  };
})(connectionStatusButtonContainer);
