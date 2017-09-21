import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/2.0/users';

export default function kickUser(meetingId, userId) {
  check(meetingId, String);
  check(userId, String);

  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      'user.kicked': true,
      'user.connection_status': 'offline',
      'user.voiceUser.talking': false,
      'user.voiceUser.joined': false,
      'user.voiceUser.muted': false,
      'user.time_of_joining': 0,
      'user.listenOnly': false,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Kicking user from collection: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Kicked user id=${userId} meeting=${meetingId}`);
    }

    return null;
  };

  return Users.update(selector, modifier, cb);
}
