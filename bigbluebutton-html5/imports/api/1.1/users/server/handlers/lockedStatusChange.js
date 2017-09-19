import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import Users from './../../';

import muteToggle from '../methods/muteToggle';

export default function handleLockedStatusChange({ payload }) {
  const meetingId = payload.meeting_id;
  const userId = payload.userid;
  const isLocked = payload.locked;

  check(meetingId, String);
  check(userId, String);
  check(isLocked, Boolean);

  const selector = {
    meetingId,
    userId,
  };

  const User = Users.findOne(selector);
  if (!User) {
    throw new Meteor.Error(
      'user-not-found', 'You need a valid user to be able to set presenter');
  }

  const modifier = {
    $set: {
      'user.locked': isLocked,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Assigning user locked status: ${err}`);
    }

    if (numChanged) {
      if (User.user.role === 'VIEWER'
          && !User.user.listenOnly
          && !User.user.voiceUser.muted
          && User.user.voiceUser.joined
          && isLocked) {
        const credentials = {
          meetingId,
          requesterUserId: userId,
        };

        muteToggle(credentials, userId, true);
      }

      return Logger.info(`Assigned locked status '${isLocked
        ? 'locked' : 'unlocked'}' id=${userId} meeting=${meetingId}`);
    }
  };

  return Users.update(selector, modifier, cb);
}
