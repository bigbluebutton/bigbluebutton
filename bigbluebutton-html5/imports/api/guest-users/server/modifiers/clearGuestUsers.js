import GuestUsers from '/imports/api/guest-users';
import Logger from '/imports/startup/server/logger';

export default async function clearGuestUsers(meetingId) {
  if (meetingId) {
    try {
      const numberAffected = await GuestUsers.removeAsync({ meetingId });

      if (numberAffected) {
        Logger.info(`Cleared GuestUsers in (${meetingId})`);
      }
    } catch (err) {
      Logger.info(`Error on clearing GuestUsers in (${meetingId}). ${err}`);
    }
  } else {
    try {
      const numberAffected = await GuestUsers.removeAsync({});

      if (numberAffected) {
        Logger.info('Cleared GuestUsers in all meetings');
      }
    } catch (err) {
      Logger.error(`Error on clearing GuestUsers in all meetings. ${err}`);
    }
  }
}
