import { check } from 'meteor/check';
import GuestUsers from '/imports/api/guest-users';
import Logger from '/imports/startup/server/logger';
import updatePositionInWaitingQueue from '../methods/updatePositionInWaitingQueue';

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

    /**
     *  Update position of waiting users after user has left the guest lobby 
     */
     updatePositionInWaitingQueue(meetingId);

    return Logger.info(`Removed guest user id=${intId} meetingId=${meetingId}`);
  };

  return GuestUsers.remove(selector, cb);
}
