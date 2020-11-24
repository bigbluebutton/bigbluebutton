import LocalSettings from '/imports/api/local-settings';
import Logger from '/imports/startup/server/logger';

export default function clearLocalSettings(meetingId) {
  try {
    const numberAffected = LocalSettings.remove(selector);

    if (numberAffected) {
      Logger.info(`Cleared Local Settings (${meetingId})`);
    }
  } catch (err) {
    Logger.error(`Error on clearing Local Settings (${meetingId}). ${err}`);
  }
}
