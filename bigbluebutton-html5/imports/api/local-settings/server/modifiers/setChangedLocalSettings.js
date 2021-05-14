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

  try {
    const { numChanged } = LocalSettings.upsert(selector, modifier);

    if (numChanged) {
      Logger.info(`Updated settings for user ${userId} on meeting ${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Error on update settings. ${err}`);
  }
}
