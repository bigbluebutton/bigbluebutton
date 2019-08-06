import { check } from 'meteor/check';
import LocalSettings from '/imports/api/local-settings';
import Logger from '/imports/startup/server/logger';

export default function setChangedLocalSettings(meetingId, userId, settings) {
  check(meetingId, String);
  check(userId, String);
  check(settings, Object);

  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      settings,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`${err}`);
    }

    if (numChanged) {
      Logger.info(`Updated settings for user ${userId} on meeting ${meetingId}`);
    }
  };

  return LocalSettings.upsert(selector, modifier, cb);
}
