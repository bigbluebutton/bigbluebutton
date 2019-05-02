import UserInfos from '/imports/api/users-infos';
import Logger from '/imports/startup/server/logger';

export default function addUserInfo(userInfo, requesterUserId, meetingId) {
  const info = {
    meetingId,
    requesterUserId,
    userInfo,
  };
  const cb = (err) => {
    if (err) {
      return Logger.error(`Adding user information to collection: ${err}`);
    }
    return Logger.info(`Added user information: requester id=${requesterUserId} meeting=${meetingId}`);
  };

  return UserInfos.insert(info, cb);
}
