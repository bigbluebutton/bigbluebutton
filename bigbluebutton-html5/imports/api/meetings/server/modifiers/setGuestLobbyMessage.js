import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function setGuestLobbyMessage(meetingId, guestLobbyMessage) {
  check(meetingId, String);
  check(guestLobbyMessage, String);

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: {
      guestLobbyMessage,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Changing meeting guest lobby message: ${err}`);
    }

    if (!numChanged) {
      return Logger.info(`Meeting's ${meetingId} guest lobby message=${guestLobbyMessage} wasn't updated`);
    }

    return Logger.info(`Meeting's ${meetingId} guest lobby message=${guestLobbyMessage} updated`);
  };

  return Meetings.update(selector, modifier, cb);
}
