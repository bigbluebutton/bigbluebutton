import UserInfos from '/imports/api/users-infos';
import Logger from '/imports/startup/server/logger';

export default function clearUsersInfoForRequester(meetingId, requesterUserId) {
  try {
    const numberAffected = UserInfos.remove({ meetingId });

    if (numberAffected) {
      Logger.info(`Cleared User Infos requested by user=${requesterUserId}`);
    }
  } catch (err) {
    Logger.info(`Error on clearing User Infos requested by user=${requesterUserId}. ${err}`);
  }
}
