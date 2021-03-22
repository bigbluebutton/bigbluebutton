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
    Logger.error(`Adding note to the collection: ${err}`);
  }
}
