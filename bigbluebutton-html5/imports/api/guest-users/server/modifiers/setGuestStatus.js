import { check } from 'meteor/check';
import GuestUsers from '/imports/api/guest-users';
import Logger from '/imports/startup/server/logger';
import updatePositionInWaitingQueue from '../methods/updatePositionInWaitingQueue';

const GUEST_STATUS_ALLOW = 'ALLOW';
const GUEST_STATUS_DENY = 'DENY';
export default function setGuestStatus(meetingId, intId, status, approvedBy = null) {
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

  /** Update position of waiting users after user has been
   *  approved or denied by the moderator 
   */
  const callback = (err) => {
    if (err) {      
      Logger.error(`Updating position in waiting queue: ${err}`);
    }
    
    updatePositionInWaitingQueue(meetingId);  
  }

  try {
    const numberAffected = GuestUsers.update(selector, modifier, callback);

    if (numberAffected) {
      Logger.info(`Updated status=${status} user=${intId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Updating status=${status} user=${intId}: ${err}`);
  }
}
