import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

export default function userEjected(meetingId, userId) {
  check(meetingId, String);
  check(userId, String);

  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      ejected: true,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Ejecting user from collection: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Ejected user id=${userId} meeting=${meetingId}`);
    }

    return null;
  };

  return Users.update(selector, modifier, cb);
}
