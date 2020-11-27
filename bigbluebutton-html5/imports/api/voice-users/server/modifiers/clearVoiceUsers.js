import Logger from '/imports/startup/server/logger';
import VoiceUsers from '/imports/api/voice-users';

export default function clearVoiceUser(meetingId) {
  if (meetingId) {
    try {
      const numberAffected = VoiceUsers.remove({ meetingId });

      if (numberAffected) {
        return Logger.info(`Cleared VoiceUsers in (${meetingId})`);
      }
    } catch (err) {
      return Logger.error(`Error on clearing VoiceUsers in ${meetingId}. ${err}`);
    }
  }

  try {
    const numberAffected = VoiceUsers.remove({});

    if (numberAffected) {
      return Logger.info('Cleared VoiceUsers in all meetings');
    }
  } catch (err) {
    return Logger.error(`Error on clearing VoiceUsers. ${err}`);
  }
}
