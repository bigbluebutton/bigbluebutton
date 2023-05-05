import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users/index';

export default function clearUsers(meetingId) {
  if (meetingId) {
    try {
      const numberAffected = Users.remove({ meetingId });

      if (numberAffected) {
        Logger.info(`Cleared Users (${meetingId})`);
      }
    } catch (err) {
      Logger.error(`Error clearing Users (${meetingId}). ${err}`);
    }
  } else {
    try {
      const numberAffected = Users.remove({});

      if (numberAffected) {
        Logger.info('Cleared Users (all)');
      }
    } catch (err) {
      Logger.error(`Error clearing Users (all). ${err}`);
    }
  }
}
