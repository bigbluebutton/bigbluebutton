import UserInfos from '/imports/api/users-infos';
import Logger from '/imports/startup/server/logger';

export default function addUserInfo(userInfo, requesterUserId, meetingId) {
  const info = {
    meetingId,
    requesterUserId,
    userInfo,
  };

  try {
    const numberAffected = UserInfos.insert(info);

    if (numberAffected) {
      Logger.info(`Added user information: requester id=${requesterUserId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Adding user information to collection: ${err}`);
  }
}
