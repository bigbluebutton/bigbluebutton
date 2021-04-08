import { check } from 'meteor/check';
import UsersPersistentData from '/imports/api/users-persistent-data';
import Logger from '/imports/startup/server/logger';

export default function setloggedOutStatus(userId, meetingId, status = true) {
  check(userId, String);
  check(meetingId, String);
  check(status, Boolean);

  const selector = {
    userId,
    meetingId,
  };

  const modifier = {
    $set: {
      loggedOut: status,
    },
  };

  try {
    UsersPersistentData.update(selector, modifier);
  } catch (err) {
    Logger.error(`Setting users persistent data's logged out status to the collection: ${err}`);
  }
}
