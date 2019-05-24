import { check } from 'meteor/check';
import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';

export default function setChangedSettings(userId, setting, value) {
  check(userId, String);
  check(setting, String);
  check(value, Match.Any);

  const selector = {
    userId,
  };

  const modifier = {
    $set: {},
  };

  modifier.$set[setting] = value;

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`${err}`);
    }

    if (numChanged) {
      Logger.info(`Updated setting ${setting} to ${value} for user ${userId}`);
    }
  };

  return Users.update(selector, modifier, cb);
}
