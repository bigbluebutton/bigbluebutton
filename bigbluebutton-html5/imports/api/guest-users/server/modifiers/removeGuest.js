import { check } from 'meteor/check';
import GuestUsers from '/imports/api/guest-users';
import Logger from '/imports/startup/server/logger';

export default function removeGuest(meetingId, intId) {
  check(meetingId, String);
  check(intId, String);

  const selector = {
    meetingId,
    intId,
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Removing guest user from collection: ${err}`);
    }

    return Logger.info(`Removed guest user id=${intId} meetingId=${meetingId}`);
  };

  return GuestUsers.remove(selector, cb);
}
