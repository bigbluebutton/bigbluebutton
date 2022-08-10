import Logger from '/imports/startup/server/logger';
import VoiceUsers from '/imports/api/voice-users';

export default function clearVoiceUser(meetingId, intId) {
  try {
    check(meetingId, String);
    check(intId, String);

    const numberAffected = VoiceUsers.remove({ meetingId, intId });

    if (numberAffected) {
      Logger.info(`Remove voiceUser=${intId} meeting=${meetingId} (clear)`);
    }

    return numberAffected;
  } catch (error) {
    Logger.error(`Error on clearing voiceUser=${intId} meeting=${meetingId}. ${error}`);
    return 0;
  }
}
