import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

export default function userInactivityInspect(userId, responseDelay) {
  check(userId, String);
  check(responseDelay, Match.Integer);

  const selector = {
    userId,
  };

  const modifier = {
    $set: {
      inactivityCheck: true,
      responseDelay,
    },
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Inactivity check for user ${userId}: ${err}`);
    }

    return Logger.info(`Upserted user ${userId} with inactivity inspect`);
  };

  return Users.upsert(selector, modifier, cb);
}
