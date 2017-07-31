import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import VoiceUser from '/imports/api/2.0/voice-user';
import flat from 'flat';

export default function addVoiceUser(meetingId, voiceUser) {
  check(meetingId, String);
  check(voiceUser, {
    voiceConf: String,
    voiceUserId: String,
    intId: String,
    callerIdName: String,
    callerIdNum: String,
    muted: Boolean,
    talking: Boolean,
    callingWith: String,
  });

  const selector = {
    meetingId,
    intId: voiceUser.intId,
  };

  const modifier = {
    $set: Object.assign(
      { meetingId },
      flat(voiceUser),
    ),
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Add voice user=${voiceUser.intId}: ${err}`);
    }

    return Logger.verbose(`Add voice user=${voiceUser.intId} meeting=${meetingId}`);
  };

  return VoiceUser.update(selector, modifier, cb);
}
