import Logger from '/imports/startup/server/logger';
import VoiceCallStates from '/imports/api/voice-call-states';

export default function clearVoiceCallStates(meetingId) {
  if (meetingId) {
    try {
      const numberAffected = VoiceCallStates.remove({ meetingId });

      if (numberAffected) {
        Logger.info(`Cleared VoiceCallStates in (${meetingId})`);
      }
    } catch (err) {
      Logger.info(`Error on clearing VoiceCallStates in (${meetingId}). ${err}`);
    }
  } else {
    try {
      const numberAffected = VoiceCallStates.remove({});

      if (numberAffected) {
        Logger.info('Cleared VoiceCallStates in all meetings');
      }
    } catch (err) {
      Logger.error(`Error on clearing VoiceCallStates in all meetings. ${err}`);
    }
  }
}
