import PresentationUploadToken from '/imports/api/presentation-upload-token';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';

export default function setUsedToken(authzToken) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(authzToken, String);

    const payload = {
      $set: {
        used: true,
      },
    };

    const numberAffected = PresentationUploadToken.update({
      meetingId,
      userId: requesterUserId,
      authzToken,
    }, payload);

    if (numberAffected) {
      Logger.info(`Token: ${authzToken} has been set as used in meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Exception while invoking method setUsedToken ${err.stack}`);
  }
}
