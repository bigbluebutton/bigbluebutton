import muteToggle from '../methods/muteToggle';

import Users from './../../';

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
    }, userId, true),
  );
}
