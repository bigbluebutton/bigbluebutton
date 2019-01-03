import UserSettings from '/imports/api/users-settings';
import Logger from '/imports/startup/server/logger';

export default function clearUsersSettings(meetingId) {
  return UserSettings.remove({ meetingId }, () => {
    Logger.info(`Cleared User Settings (${meetingId})`);
  });
}
