import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import VoiceUsers from '/imports/api/voice-users';

export default function changeUserName(payload, meetingId) {
  check(payload.body, Object);
  check(meetingId, String);

  const {
    userId,
    newUserName,
  } = payload.body;

  const selector = {
    meetingId,
    intId: userId,
  };

  // callerNum still partly contains old username which should be ok
  const modifier = {
    $set: {
      callerName: newUserName,
    },
  };

  try {
    VoiceUsers.update(selector, modifier);
    Logger.info(`Changed name=${newUserName} of voice user because of username change id=${userId} meeting=${meetingId}`);
  } catch (err) {
    Logger.error(`Changed name of voice user stream: ${err}`);
  }
}
