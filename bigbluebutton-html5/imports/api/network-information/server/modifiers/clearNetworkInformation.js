import NetworkInformation from '/imports/api/network-information';
import Logger from '/imports/startup/server/logger';

export default function clearNetworkInformation(meetingId) {
  if (meetingId) {
    try {
      const numberAffected = NetworkInformation.remove({ meetingId });

      if (numberAffected) {
        Logger.info(`Cleared Network Information (${meetingId})`);
      }
    } catch (err) {
      Logger.error(`Error on clearing Network Information (${meetingId}). ${err}`);
    }
  } else {
    try {
      const numberAffected = NetworkInformation.remove({});

      if (numberAffected) {
        Logger.info('Cleared Network Information (all)');
      }
    } catch (err) {
      Logger.error(`Error on clearing Network Information (all). ${err}`);
    }
  }
}
