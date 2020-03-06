import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { UploadRequest } from '/imports/api/upload';

export default function addUploadRequest(meetingId, source, filename, userId, success, timestamp, token) {
  check(source, String);
  check(filename, String);
  check(userId, String);
  check(success, Boolean);
  check(timestamp, Number);

  if (success) {
    check(token, String);
  }

  const selector = {
    meetingId,
    source,
    userId,
    filename,
    timestamp,
  };

  const modifier = {
    meetingId,
    source,
    userId,
    filename,
    success,
    timestamp,
    token,
  };

  const cb = (err) => {
    if (err) {
      Logger.error(`Upserting upload request: ${err}`);
      return;
    }

    Logger.debug(`Upserting upload request filename=${filename} user=${userId} meeting=${meetingId}`);
  };

  return UploadRequest.upsert(selector, modifier, cb);
}
