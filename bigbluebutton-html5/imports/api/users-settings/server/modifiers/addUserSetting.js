import { check } from 'meteor/check';
import UserSettings from '/imports/api/users-settings';
import Logger from '/imports/startup/server/logger';

export default function addUserSetting(meetingId, userId, setting, value) {
  check(meetingId, String);
  check(userId, String);
  check(setting, String);
  check(value, Match.Any);

  const selector = {
    meetingId,
    userId,
    setting,
  };
  const modifier = {
    $set: {
      meetingId,
      userId,
      setting,
      value,
    },
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Adding user setting to collection: ${err}`);
    }

    return Logger.verbose(`Upserted user setting for meetingId=${meetingId} userId=${userId} setting=${setting}`);
  };

  return UserSettings.upsert(selector, modifier, cb);
}
