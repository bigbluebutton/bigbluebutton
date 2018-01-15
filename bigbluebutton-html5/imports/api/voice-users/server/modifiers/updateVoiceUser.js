import { Match, check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import VoiceUsers from '/imports/api/voice-users';
import flat from 'flat';

export default function updateVoiceUser(meetingId, voiceUser) {
  check(meetingId, String);
  check(voiceUser, {
    intId: String,
    voiceUserId: String,
    talking: Match.Maybe(Boolean),
    muted: Match.Maybe(Boolean),
    voiceConf: String,
  });

  const { intId } = voiceUser;

  const selector = {
    meetingId,
    intId,
  };

  const modifier = {
    $set: Object.assign(
      { meetingId },
      flat(voiceUser),
    ),
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Update voiceUser=${intId}: ${err}`);
    }

    return Logger.verbose(`Update voiceUser=${intId} meeting=${meetingId}`);
  };

  return VoiceUsers.update(selector, modifier, cb);
}
