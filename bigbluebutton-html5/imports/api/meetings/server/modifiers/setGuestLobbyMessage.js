import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default async function setGuestLobbyMessage(meetingId, guestLobbyMessage) {
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
    const { numberAffected } = await Meetings.upsertAsync(selector, modifier);

    if (numberAffected) {
      Logger.verbose(`Set guest lobby message meetingId=${meetingId} guestLobbyMessage=${guestLobbyMessage}`);
    }
  } catch (err) {
    Logger.error(`Setting guest lobby message: ${err}`);
  }
}
