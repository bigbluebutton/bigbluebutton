import UserInfos from '/imports/api/users-infos';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function removeUserInformation() {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);
  const selector = {
    meetingId,
    requesterUserId,
  };

  try {
    const numberAffected = UserInfos.remove(selector);

    if (numberAffected) {
      Logger.info(`Removed user information: requester id=${requesterUserId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Removing user information from collection: ${err}`);
  }
}
