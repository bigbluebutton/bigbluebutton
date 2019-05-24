import NetworkInformation from '/imports/api/network-information';
import Logger from '/imports/startup/server/logger';

export default function clearNetworkInformation(meetingId) {
  if (meetingId) {
    return NetworkInformation.remove({ meetingId }, () => {
      Logger.info(`Cleared Network Information (${meetingId})`);
    });
  }

  return NetworkInformation.remove({}, () => {
    Logger.info('Cleared Network Information (all)');
  });
}
