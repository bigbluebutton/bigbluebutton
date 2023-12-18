import { check } from 'meteor/check';
import GuestUsers from '/imports/api/guest-users';
import Logger from '/imports/startup/server/logger';
import updatePositionInWaitingQueue from '../methods/updatePositionInWaitingQueue';

export default async function removeGuest(meetingId, intId) {
  check(meetingId, String);
  check(intId, String);

  const selector = {
    meetingId,
    intId,
  };

  try {
    const result = await GuestUsers.removeAsync(selector);
    if (result) {
      Logger.info(`Removed guest user id=${intId} meetingId=${meetingId}`);
    }
  } catch (err) {
    return Logger.error(`Removing guest user from collection: ${err}`);
  }

  // Update position of waiting users after user has left the guest lobby.
  await updatePositionInWaitingQueue(meetingId);

  return true;
}
