import UserSettings from '/imports/api/users-settings';
import Logger from '/imports/startup/server/logger';

export default function clearUsersSettings(meetingId) {
  try {
    const numberAffected = UserSettings.remove({ meetingId });

    if (numberAffected) {
      Logger.info(`Cleared User Settings (${meetingId})`);
    }
  } catch (err) {
    Logger.error(`Error on clearing User Settings (${meetingId}). ${err}`);
  }
}
