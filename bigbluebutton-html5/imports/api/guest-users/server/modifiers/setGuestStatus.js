import { check } from 'meteor/check';
import GuestUsers from '/imports/api/guest-users';
import Logger from '/imports/startup/server/logger';
import updatePositionInWaitingQueue from '../methods/updatePositionInWaitingQueue';

const GUEST_STATUS_ALLOW = 'ALLOW';
const GUEST_STATUS_DENY = 'DENY';
export default async function setGuestStatus(meetingId, intId, status, approvedBy = null) {
  check(meetingId, String);
  check(intId, String);
  check(status, String);

  const selector = {
    meetingId,
    intId,
  };

  const modifier = {
    $set: {
      approved: status === GUEST_STATUS_ALLOW,
      denied: status === GUEST_STATUS_DENY,
      approvedBy,
    },
  };

  try {
    const numberAffected = await GuestUsers.updateAsync(selector, modifier);

    if (numberAffected) {
      Logger.info(`Updated status=${status} user=${intId} meeting=${meetingId}`);
      /** Update position of waiting users after user has been
      *  approved or denied by the moderator
      */
      await updatePositionInWaitingQueue(meetingId);
    }
  } catch (err) {
    Logger.error(`Updating status=${status} user=${intId}: ${err}`);
  }
}
