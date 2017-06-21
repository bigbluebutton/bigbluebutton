import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from './../../';

export default function updateVoiceUser(meetingId, voiceUser) {
  check(meetingId, String);
  check(voiceUser, Object);

  const selector = {
    meetingId,
    user: voiceUser.intId,
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
      return Logger.error(`Updating voice user=${voiceUser.intId}: ${err}`);
    }

    if (numChanged) {
      return Logger.verbose(`Updated voice user=${voiceUser.intId} meeting=${meetingId}`);
    }
  };

  return Users.update(selector, modifier, cb);
}
