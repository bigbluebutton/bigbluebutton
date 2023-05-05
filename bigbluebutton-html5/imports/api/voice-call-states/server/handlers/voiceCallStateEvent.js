import { check } from 'meteor/check';
import VoiceCallState from '/imports/api/voice-call-states';
import Logger from '/imports/startup/server/logger';

// "CALL_STARTED", "IN_ECHO_TEST", "IN_CONFERENCE", "CALL_ENDED"

export default function handleVoiceCallStateEvent({ body }, meetingId) {
  const {
    voiceConf,
    clientSession,
    userId,
    callerName,
    callState,
  } = body;

  check(meetingId, String);
  check(voiceConf, String);
  check(clientSession, String);
  check(userId, String);
  check(callerName, String);
  check(callState, String);

  const selector = {
    meetingId,
    userId,
    clientSession,
  };

  const modifier = {
    $set: {
      meetingId,
      userId,
      voiceConf,
      clientSession,
      callState,
    },
  };

  try {
    const { numberAffected } = VoiceCallState.upsert(selector, modifier);

    if (numberAffected) {
      Logger.debug('Update voice call', {
        state: userId, meetingId, clientSession, callState,
      });
    }
  } catch (err) {
    Logger.error(`Update voice call state=${userId}: ${err}`);
  }
}
