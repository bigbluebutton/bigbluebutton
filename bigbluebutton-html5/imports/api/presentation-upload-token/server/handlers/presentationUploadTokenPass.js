import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import PresentationUploadToken from '/imports/api/presentation-upload-token';
import Presentations from '/imports/api/presentations';

export default function handlePresentationUploadTokenPass({ body, header }, meetingId) {
  check(body, Object);

  const { userId } = header;
  const { podId, authzToken, filename, presId } = body;

  check(userId, String);
  check(podId, String);
  check(authzToken, String);
  check(filename, String);
  check(presId, String)

  const selector = {
    meetingId,
    podId,
    userId,
    filename,
    presId,
  };

  const modifier = {
    meetingId,
    podId,
    userId,
    filename,
    authzToken,
    presId,
    failed: false,
    used: false,
  };

  try {
    const { insertedId } = PresentationUploadToken.upsert(selector, modifier);

    if (insertedId) {
      Logger.info(`Inserting presentationToken filename=${filename} podId=${podId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Inserting presentationToken from collection: ${err}`);
  }
}
