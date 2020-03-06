import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { UploadedFile } from '/imports/api/upload';

export default function addUploadedFile(meetingId, userId, uploadId, source, filename, url) {
  check(meetingId, String);
  check(userId, String);
  check(uploadId, String);
  check(source, String);
  check(filename, String);
  check(url, String);

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
    url,
  };

  const cb = (err) => {
    if (err) {
      Logger.error(`Upserting upload file: ${err}`);
      return;
    }

    Logger.debug(`Upserting uploaded file filename=${filename} meeting=${meetingId} source=${source}`);
  };

  return UploadedFile.upsert(selector, modifier, cb);
}
