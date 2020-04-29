import UserInfos from '/imports/api/users-infos';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function removeUserInformation() {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);
  const selector = {
    meetingId,
    requesterUserId,
  };
  const cb = (err) => {
    if (err) {
      return Logger.error(`Removing user information from collection: ${err}`);
    }
    return Logger.info(`Removed user information: requester id=${requesterUserId} meeting=${meetingId}`);
  };
  return UserInfos.remove(selector, cb);
}
