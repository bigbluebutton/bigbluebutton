import LocalSettings from '/imports/api/local-settings';
import Logger from '/imports/startup/server/logger';

export default function clearLocalSettings(meetingId) {
  return LocalSettings.remove({ meetingId }, () => {
    Logger.info(`Cleared Local Settings (${meetingId})`);
  });
}
