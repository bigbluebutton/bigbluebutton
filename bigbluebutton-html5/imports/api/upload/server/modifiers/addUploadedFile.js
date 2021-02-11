import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { UploadedFile } from '/imports/api/upload';

export default function addUploadedFile(meetingId, userId, uploadId, source, filename) {
  check(meetingId, String);
  check(userId, String);
  check(uploadId, String);
  check(source, String);
  check(filename, String);

  const selector = {
    meetingId,
    uploadId,
  };

  const modifier = {
    meetingId,
    userId,
    uploadId,
    source,
    filename,
  };

  try {
    const { numberAffected } = UploadedFile.upsert(selector, modifier);
    if (numberAffected) {
      Logger.debug(`Upserting uploaded file filename=${filename} meeting=${meetingId} source=${source}`);
    }
  } catch (err) {
    Logger.error(`Upserting upload file: ${err}`);
  }
}
