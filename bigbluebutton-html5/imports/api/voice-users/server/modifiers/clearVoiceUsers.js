import Logger from '/imports/startup/server/logger';
import VoiceUsers from '/imports/api/voice-users';

export default function clearVoiceUser(meetingId) {
  if (meetingId) {
    return VoiceUsers.remove({ meetingId }, Logger.info(`Cleared Users (${meetingId})`));
  }

  return VoiceUsers.remove({}, Logger.info('Cleared Users (all)'));
}
