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

  try {
    const { numberAffected } = PresentationUploadToken.upsert(selector, { failed: true, authzToken: null });

    if (numberAffected) {
      Logger.info(`Removing presentationToken filename=${filename} podId=${podId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Removing presentationToken from collection: ${err}`);
  }
}
