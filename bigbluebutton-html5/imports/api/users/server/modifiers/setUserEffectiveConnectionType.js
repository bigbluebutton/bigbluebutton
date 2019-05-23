import { check } from 'meteor/check';
import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';

export default function setUserEffectiveConnectionType(meetingId, userId, effectiveConnectionType) {
  check(meetingId, String);
  check(userId, String);
  check(effectiveConnectionType, String);

  const selector = {
    meetingId,
    userId,
    effectiveConnectionType: { $ne: effectiveConnectionType },
  };

  const modifier = {
    $set: {
      effectiveConnectionType,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`Updating user ${userId}: ${err}`);
    }

    if (numChanged) {
      Logger.info(`Updated user ${userId} effective connection to ${effectiveConnectionType} in meeting ${meetingId}`);
    }
  };

  return Users.update(selector, modifier, cb);
}
