import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import Settings from '/imports/ui/services/settings';
import { makeCall } from '/imports/ui/services/api';
import StatusNotifier from './component';

const ROLE_VIEWER = Meteor.settings.public.user.role_viewer;

const StatusNotifierContainer = ({ ...props }) => <StatusNotifier {...props} />;

export default withTracker((props) => {
  const AppSettings = Settings.application;
  const currentUser = Users.findOne({ userId: Auth.userID }, { fields: { userId: 1, role: 1 } });
  const { status } = props;
  const emojiUsers = Users.find({ meetingId: Auth.meetingID, emoji: status }, {
    fields: {
      emojiTime: 1, emoji: 1, userId: 1, name: 1, color: 1,
    },
  })
    .fetch()
    .filter(u => u.emoji === status && u.userId !== currentUser.userId);
  const clearUserStatus = userId => makeCall('setEmojiStatus', userId, 'none');

  return {
    isViewer: currentUser.role === ROLE_VIEWER,
    clearUserStatus,
    emojiUsers,
    status,
    raiseHandAudioAlert: AppSettings.raiseHandAudioAlerts,
    raiseHandPushAlert: AppSettings.raiseHandPushAlerts,
  };
})(StatusNotifierContainer);
