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

  try {
    const { numberAffected } = Meetings.upsert(selector, modifier);

    if (numberAffected) {
      Logger.verbose(`Set guest lobby message meetingId=${meetingId} guestLobbyMessage=${guestLobbyMessage}`);
    }
  } catch (err) {
    Logger.error(`Setting guest lobby message: ${err}`);
  }
}
