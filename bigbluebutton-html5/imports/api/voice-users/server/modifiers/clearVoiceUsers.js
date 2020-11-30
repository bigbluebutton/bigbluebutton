import Logger from '/imports/startup/server/logger';
import VoiceUsers from '/imports/api/voice-users';

export default function clearVoiceUser(meetingId) {
  if (meetingId) {
    try {
      const numberAffected = VoiceUsers.remove({ meetingId });

      if (numberAffected) {
        Logger.info(`Cleared VoiceUsers in (${meetingId})`);
      }
    } catch (err) {
      Logger.error(`Error on clearing VoiceUsers in ${meetingId}. ${err}`);
    }
  } else {
    try {
      const numberAffected = VoiceUsers.remove({});

      if (numberAffected) {
        Logger.info('Cleared VoiceUsers in all meetings');
      }
    } catch (err) {
      Logger.error(`Error on clearing VoiceUsers. ${err}`);
    }
  }
}
