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
    userId,
  };

  const modifier = {
    $set: {
      locked,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Changing user lock setting: ${err}`);
    }

    if (!numChanged) {
      return Logger.info(`User's userId=${userId} lock status wasn't updated`);
    }

    return Logger.info(`User's userId=${userId} lock status was changed to: ${locked} by user userId=${lockedBy}`);
  };

  return Users.upsert(selector, modifier, cb);
}
