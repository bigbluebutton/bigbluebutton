import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import Settings from '/imports/ui/services/settings';
import ConnectionStatusButtonComponent from './component';
import { USER_CURRENT_STATUS_SUBSCRIPTION } from '../queries';
import Auth from '/imports/ui/services/auth';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';

const connectionStatusButtonContainer = (props) => {
  const { data } = useDeduplicatedSubscription(USER_CURRENT_STATUS_SUBSCRIPTION, {
    variables: { userId: Auth.userID },
  });
  const myCurrentStatus = data && data.length > 0
    ? data[0].currentStatus
    : 'normal';

  return <ConnectionStatusButtonComponent myCurrentStatus={myCurrentStatus} {...props} />;
};

export default withTracker(() => {
  const { connected } = Meteor.status();
  const isGridLayout = Session.get('isGridEnabled');
  const { paginationEnabled } = Settings.application;
  const { viewParticipantsWebcams } = Settings.dataSaving;

  return {
    connected,
    isGridLayout,
    paginationEnabled,
    viewParticipantsWebcams,
  };
})(connectionStatusButtonContainer);
