import UserInfos from '/imports/api/users-infos';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';

export default function removeUserInformation() {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);

    const selector = {
      meetingId,
      requesterUserId,
    };

    const numberAffected = UserInfos.remove(selector);

    if (numberAffected) {
      Logger.info(`Removed user information: requester id=${requesterUserId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Exception while invoking method removeUserInformation ${err.stack}`);
  }
}
