import Logger from '/imports/startup/server/logger';
import UsersPersistentData from '/imports/api/users-persistent-data/index';

export default async function clearUsersPersistentData(meetingId) {
  if (meetingId) {
    try {
      const numberAffected = await UsersPersistentData.removeAsync({ meetingId });

      if (numberAffected) {
        Logger.info(`Cleared users persistent data (${meetingId})`);
      }
    } catch (err) {
      Logger.error(`Error clearing users persistent data (${meetingId}). ${err}`);
    }
  } else {
    try {
      const numberAffected = await UsersPersistentData.removeAsync({});

      if (numberAffected) {
        Logger.info('Cleared users persistent data (all)');
      }
    } catch (err) {
      Logger.error(`Error clearing users persistent data (all). ${err}`);
    }
  }
}
