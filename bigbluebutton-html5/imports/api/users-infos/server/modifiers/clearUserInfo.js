import UserInfos from '/imports/api/users-infos';
import Logger from '/imports/startup/server/logger';

export default function clearUsersInfo(meetingId) {
  try {
    const numberAffected = UserInfos.remove({ meetingId });

    if (numberAffected) {
      Logger.info(`Cleared User Infos (${meetingId})`);
    }
  } catch (err) {
    Logger.error(`Error on clearing User Infos (${meetingId}). ${err}`);
  }
}
