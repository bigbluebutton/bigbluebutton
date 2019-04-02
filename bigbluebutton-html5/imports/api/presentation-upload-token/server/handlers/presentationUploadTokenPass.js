import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import PresentationUploadToken from '/imports/api/presentation-upload-token';

export default function handlePresentationUploadTokenPass({ body, header }, meetingId) {
  check(body, Object);

  const { userId } = header;
  const { podId, authzToken, filename } = body;

  check(userId, String);
  check(podId, String);
  check(authzToken, String);
  check(filename, String);

  const selector = {
    meetingId,
    podId,
    userId,
    filename,
  };

  const doc = {
    meetingId,
    podId,
    userId,
    filename,
    authzToken,
    failed: false,
  };

  const cb = (err) => {
    if (err) {
      Logger.error(`Inserting presentationToken from collection: ${err}`);
      return;
    }

    Logger.info(`Inserting presentationToken filename=${filename} podId=${podId} meeting=${meetingId}`);
  };

  return PresentationUploadToken.upsert(selector, doc, cb);
}
