import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import VoiceUsers from '/imports/api/voice-users';
import { clearSpokeTimeout } from '/imports/api/common/server/helpers';

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

  try {
    clearSpokeTimeout(meetingId, intId);
    const numberAffected = VoiceUsers.update(selector, modifier);

    if (numberAffected) {
      Logger.info(`Remove voiceUser=${intId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Remove voiceUser=${intId}: ${err}`);
  }
}
