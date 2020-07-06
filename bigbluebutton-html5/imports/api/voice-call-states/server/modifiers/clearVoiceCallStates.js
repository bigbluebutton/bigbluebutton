import Logger from '/imports/startup/server/logger';
import VoiceCallStates from '/imports/api/voice-users';

export default function clearVoiceCallStates(meetingId) {
  if (meetingId) {
    return VoiceCallStates.remove({ meetingId }, () => {
      Logger.info(`Cleared VoiceCallStates in (${meetingId})`);
    });
  }

  return VoiceCallStates.remove({}, () => {
    Logger.info('Cleared VoiceCallStates in all meetings');
  });
}
