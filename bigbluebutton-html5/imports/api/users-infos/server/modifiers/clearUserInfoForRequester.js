import UserInfos from '/imports/api/users-infos';
import Logger from '/imports/startup/server/logger';

export default function clearUsersInfoForRequester(meetingId, requesterUserId) {
  return UserInfos.remove({ meetingId }, () => {
    Logger.info(`Cleared User Infos requested by user=${requesterUserId}`);
  });
}
