import UserInfos from '/imports/api/users-infos';
import Logger from '/imports/startup/server/logger';

export default function removeUserInformation(credentials, meetingId, requesterUserId) {
  const selector = {
    meetingId,
    requesterUserId,
  };
  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Removing user information from collection: ${err}`);
    }
    return Logger.info(`Removed user information: requester id=${requesterUserId} meeting=${meetingId}`);
  };
  return UserInfos.remove(selector, cb);
}
