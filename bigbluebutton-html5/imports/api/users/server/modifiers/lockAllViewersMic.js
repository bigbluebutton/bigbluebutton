import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

import Users from '/imports/api/users';

export default function lockAllViewersMic(meetingId) {
  const selector = {
    meetingId,
    'user.role': 'VIEWER',
    'user.listenOnly': false,
    'user.locked': true,
    'user.voiceUser.joined': true,
    'user.voiceUser.muted': false,
  };

  const usersToMute = Users.find(selector).fetch();

  usersToMute.forEach(user =>
    muteToggle({
      meetingId,
      requesterUserId: user.userId,
    }, userId, true)
  );
};
