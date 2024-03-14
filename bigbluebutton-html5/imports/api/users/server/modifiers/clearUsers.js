import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users/index';

export default async function clearUsers(meetingId) {
  if (meetingId) {
    try {
      const numberAffected = await Users.removeAsync({ meetingId });

      if (numberAffected) {
        Logger.info(`Cleared Users (${meetingId})`);
      }
    } catch (err) {
      Logger.error(`Error clearing Users (${meetingId}). ${err}`);
    }
  } else {
    try {
      const numberAffected = await Users.removeAsync({});

      if (numberAffected) {
        Logger.info('Cleared Users (all)');
      }
    } catch (err) {
      Logger.error(`Error clearing Users (all). ${err}`);
    }
  }
}
