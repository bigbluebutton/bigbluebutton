import { check } from 'meteor/check';
import Users from './../../';
import Logger from '/imports/startup/server/logger';

export default function updateVoiceUser(meetingId, userId, voiceUser) {
  check(meetingId, String);
  check(userId, String);
  check(voiceUser, Object);

  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      'user.voiceUser.talking': voiceUser.talking,
      'user.voiceUser.joined': voiceUser.joined,
      'user.voiceUser.locked': voiceUser.locked,
      'user.voiceUser.muted': voiceUser.muted,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Updating voice user=${userId}: ${err}`);
    }

    if (numChanged) {
      return Logger.verbose(`Updated voice user=${userId} meeting=${meetingId}`);
    }
  };

  return Users.update(selector, modifier, cb);
}
