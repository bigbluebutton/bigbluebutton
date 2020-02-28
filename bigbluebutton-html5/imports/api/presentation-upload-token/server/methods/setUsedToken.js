import PresentationUploadToken from '/imports/api/presentation-upload-token';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function setUsedToken(authzToken) {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  const payload = {
    $set: {
      used: true,
    },
  };
  const cb = (err) => {
    if (err) {
      Logger.error(`Unable to set token as used : ${err}`);
      return;
    }

    Logger.info(`Token: ${authzToken} has been set as used in meeting=${meetingId}`);
  };

  return PresentationUploadToken.update({
    meetingId,
    userId: requesterUserId,
    authzToken,
  }, payload, cb);
}
