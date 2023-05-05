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

  try {
    const { numberAffected } = Users.update(selector, modifier);

    if (numberAffected) {
      Logger.info(`Updated user ${userId} with inactivity inspect`);
    }
  } catch (err) {
    Logger.error(`Inactivity check for user ${userId}: ${err}`);
  }
}
