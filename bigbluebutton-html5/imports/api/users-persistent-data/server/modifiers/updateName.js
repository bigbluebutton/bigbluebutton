import { check } from 'meteor/check';
import UsersPersistentData from '/imports/api/users-persistent-data';
import Logger from '/imports/startup/server/logger';

export default function updateUserName(userId, meetingId, newUserName) {
  check(userId, String);
  check(meetingId, String);
  check(newUserName, String);

  const selector = {
    userId,
    meetingId,
  };

  const modifier = {
    $set: {
      name: newUserName,
    },
  };

  try {
    UsersPersistentData.update(selector, modifier);
  } catch (err) {
    Logger.error(`Updating users persistent data's name to the collection: ${err}`);
  }
}
