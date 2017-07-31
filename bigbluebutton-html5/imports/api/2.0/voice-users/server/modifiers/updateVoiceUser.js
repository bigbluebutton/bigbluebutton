import { Match, check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import VoiceUser from '/imports/api/2.0/voice-users';
import flat from 'flat';

export default function removeVoiceUser(meetingId, voiceUser) {
  check(meetingId, String);
  check(voiceUser, {
    intId: String,
    voiceUserId: String,
    talking: Match.Maybe(Boolean),
    muted: Match.Maybe(Boolean),
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
