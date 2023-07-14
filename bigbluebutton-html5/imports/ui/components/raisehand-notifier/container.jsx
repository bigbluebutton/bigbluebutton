import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import Settings from '/imports/ui/services/settings';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import { makeCall } from '/imports/ui/services/api';
import RaiseHandNotifier from './component';

const ROLE_VIEWER = Meteor.settings.public.user.role_viewer;

const StatusNotifierContainer = (props) => {
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const currentUser = users[Auth.meetingID][Auth.userID];
  const isViewer = currentUser.role === ROLE_VIEWER;
  const isPresenter = currentUser.presenter;
  return (
    <RaiseHandNotifier {...{
      ...props,
      isViewer,
      isPresenter,
    }}
    />
  );
};

export default withTracker(() => {
  const AppSettings = Settings.application;
  const raiseHandUsers = Users.find({
    meetingId: Auth.meetingID,
    raiseHand: true,
  }, {
    fields: {
      raiseHandTime: 1, raiseHand: 1, userId: 1, name: 1, color: 1, role: 1, avatar: 1,
    },
    sort: { raiseHandTime: 1 },
  }).fetch();
  const lowerUserHands = (userId) => makeCall('changeRaiseHand', false, userId);

  return {
    lowerUserHands,
    raiseHandUsers,
    raiseHandAudioAlert: AppSettings.raiseHandAudioAlerts,
    raiseHandPushAlert: AppSettings.raiseHandPushAlerts,
  };
})(StatusNotifierContainer);
