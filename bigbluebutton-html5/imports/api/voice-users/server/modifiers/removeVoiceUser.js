import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import VoiceUsers from '/imports/api/voice-users';
import { timeoutHandles } from './updateVoiceUser';

export default function removeVoiceUser(meetingId, voiceUser) {
  check(meetingId, String);
  check(voiceUser, {
    voiceConf: String,
    voiceUserId: String,
    intId: String,
  });

  const { intId } = voiceUser;

  const selector = {
    meetingId,
    intId,
  };

  const modifier = {
    $set: {
      muted: false,
      talking: false,
      listenOnly: false,
      joined: false,
      spoke: false,
    },
  };

  if (timeoutHandles[`${meetingId}-${intId}`]) {
    Meteor.clearTimeout(timeoutHandles[`${meetingId}-${intId}`]);
    delete timeoutHandles[`${meetingId}-${intId}`];
  }

  const cb = (err) => {
    if (err) {
      return Logger.error(`Remove voiceUser=${intId}: ${err}`);
    }

    return Logger.info(`Remove voiceUser=${intId} meeting=${meetingId}`);
  };

  return VoiceUsers.update(selector, modifier, cb);
}
