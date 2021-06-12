import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import { check } from 'meteor/check';

export default function changeUserLock(meetingId, payload) {
  check(meetingId, String);
  check(payload, {
    userId: String,
    locked: Boolean,
    lockedBy: String,
  });

  const { userId, locked, lockedBy } = payload;

  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      locked,
    },
  };

  try {
    const { numberAffected } = Users.update(selector, modifier);

    if (numberAffected) {
      Logger.info(`User's userId=${userId} lock status was changed to: ${locked} by user userId=${lockedBy}`);
    } else {
      Logger.info(`User's userId=${userId} lock status wasn't updated`);
    }
  } catch (err) {
    Logger.error(`Changing user lock setting: ${err}`);
  }
}
