import UserSettings from '/imports/api/users-settings';
import Logger from '/imports/startup/server/logger';

export default async function clearUsersSettings(meetingId) {
  try {
    const numberAffected = await UserSettings.removeAsync({ meetingId });

    if (numberAffected) {
      Logger.info(`Cleared User Settings (${meetingId})`);
    }
  } catch (err) {
    Logger.error(`Error on clearing User Settings (${meetingId}). ${err}`);
  }
}
