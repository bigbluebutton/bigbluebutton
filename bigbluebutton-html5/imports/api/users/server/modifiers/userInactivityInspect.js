import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

export default function userInactivityInspect(userId, responseDelay) {
  check(userId, String);
  check(responseDelay, Match.Integer);

  const selector = {
    userId,
    inactivityCheck: false,
  };

  const modifier = {
    $set: {
      inactivityCheck: true,
      responseDelay,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Inactivity check for user ${userId}: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Updated user ${userId} with inactivity inspect`);
    }

    return null;
  };

  return Users.update(selector, modifier, cb);
}
