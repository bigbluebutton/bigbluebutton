import PresentationUploadToken from '/imports/api/presentation-upload-token';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function setUsedToken(credentials, authzToken) {
  const { meetingId, requesterUserId, requesterToken } = credentials;
  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

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
