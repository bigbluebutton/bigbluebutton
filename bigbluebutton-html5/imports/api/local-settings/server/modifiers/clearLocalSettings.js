import LocalSettings from '/imports/api/local-settings';
import Logger from '/imports/startup/server/logger';

export default async function clearLocalSettings(meetingId) {
  try {
    const numberAffected = await LocalSettings.removeAsync({ meetingId });

    if (numberAffected) {
      Logger.info(`Cleared Local Settings (${meetingId})`);
    }
  } catch (err) {
    Logger.error(`Error on clearing Local Settings (${meetingId}). ${err}`);
  }
}
