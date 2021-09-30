import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import Settings from '/imports/ui/services/settings';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import { makeCall } from '/imports/ui/services/api';
import StatusNotifier from './component';

const ROLE_VIEWER = Meteor.settings.public.user.role_viewer;

const StatusNotifierContainer = (props) => {
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const currentUser = users[Auth.meetingID][Auth.userID];
  const isViewer = currentUser.role === ROLE_VIEWER;
  const isPresenter = currentUser.presenter;
  return (
    <StatusNotifier {...{
      ...props,
      isViewer,
      isPresenter,
    }}
    />
  );
};

export default withTracker((props) => {
  const AppSettings = Settings.application;
  const { status } = props;
  const emojiUsers = Users.find({ meetingId: Auth.meetingID, emoji: status }, {
    fields: {
      emojiTime: 1, emoji: 1, userId: 1, name: 1, color: 1,
    },
    sort: { emojiTime: 1 },
  })
    .fetch()
    .filter((u) => u.emoji === status && u.userId !== Auth.userID);
  const clearUserStatus = (userId) => makeCall('setEmojiStatus', userId, 'none');

  return {
    clearUserStatus,
    emojiUsers,
    status,
    raiseHandAudioAlert: AppSettings.raiseHandAudioAlerts,
    raiseHandPushAlert: AppSettings.raiseHandPushAlerts,
  };
})(StatusNotifierContainer);
