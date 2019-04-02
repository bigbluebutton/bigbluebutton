import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import PresentationUploadToken from '/imports/api/presentation-upload-token';

export default function handlePresentationUploadTokenFail({ body, header }, meetingId) {
  check(body, Object);

  const { userId } = header;
  const { podId, filename } = body;

  check(userId, String);
  check(podId, String);
  check(filename, String);

  const selector = {
    meetingId,
    userId,
    podId,
    filename,
  };

  const cb = (err) => {
    if (err) {
      Logger.error(`Removing presentationToken from collection: ${err}`);
      return;
    }

    Logger.info(`Removing presentationToken filename=${filename} podId=${podId} meeting=${meetingId}`);
  };

  return PresentationUploadToken.upsert(selector, { failed: true, authzToken: null }, cb);
}
