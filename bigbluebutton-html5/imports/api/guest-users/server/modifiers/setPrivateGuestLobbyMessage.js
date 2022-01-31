import GuestUsers from '/imports/api/guest-users';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function setPrivateGuestLobbyMessage(meetingId, guestId, guestLobbyMessage) {
  check(meetingId, String);
  check(guestId, String);
  check(guestLobbyMessage, String);

  const intId=guestId;

  const selector = {
    meetingId,
    intId,
  };

  const modifier = {
    $set: {
      privateGuestLobbyMessage: guestLobbyMessage,
    },
  };

  try {
    const numberAffected = GuestUsers.update(selector, modifier);

    if (numberAffected) {
      Logger.verbose(`Set a private guest lobby message meetingId=${meetingId} for guest user=${guestId} to guestLobbyMessage=${guestLobbyMessage}`);
    }
  } catch (err) {
    Logger.error(`Setting a private guest lobby message to ${guestId}: ${err}`);
  }
}

