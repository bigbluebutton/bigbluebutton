import ConnectionStatus from '/imports/api/connection-status';
import Logger from '/imports/startup/server/logger';

export default function clearConnectionStatus(meetingId) {
  const selector = {};

  if (meetingId) {
    selector.meetingId = meetingId;
  }

  try {
    const numberAffected = ConnectionStatus.remove(selector);

    if (numberAffected) {
      if (meetingId) {
        Logger.info(`Removed ConnectionStatus (${meetingId})`);
      } else {
        Logger.info('Removed ConnectionStatus (all)');
      }
    } else {
      Logger.warn('Removing ConnectionStatus nonaffected');
    }
  } catch (err) {
    Logger.error(`Removing ConnectionStatus: ${err}`);
  }
}
