import ConnectionStatus from '/imports/api/connection-status';
import Logger from '/imports/startup/server/logger';

export default function clearConnectionStatus(meetingId) {
  if (meetingId) {
    return ConnectionStatus.remove({ meetingId }, () => {
      Logger.info(`Cleared ConnectionStatus (${meetingId})`);
    });
  }

  return ConnectionStatus.remove({}, () => {
    Logger.info('Cleared ConnectionStatus (all)');
  });
}
