import UserInfos from '/imports/api/users-infos';
import Logger from '/imports/startup/server/logger';

export default async function clearUsersInfo(meetingId) {
  try {
    const numberAffected = await UserInfos.removeAsync({ meetingId });

    if (numberAffected) {
      Logger.info(`Cleared User Infos (${meetingId})`);
    }
  } catch (err) {
    Logger.error(`Error on clearing User Infos (${meetingId}). ${err}`);
  }
}
