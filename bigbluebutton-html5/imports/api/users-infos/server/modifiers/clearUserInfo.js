import UserInfos from '/imports/api/users-infos';
import Logger from '/imports/startup/server/logger';

export default function clearUsersInfo(meetingId) {
  return UserInfos.remove({ meetingId }, () => {
    Logger.info(`Cleared User Infos (${meetingId})`);
  });
}
