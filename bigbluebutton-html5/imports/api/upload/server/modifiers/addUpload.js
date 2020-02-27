import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Upload from '/imports/api/upload';

export default function addUpload(meetingId, source, filename, userId, success, token) {
  check(source, String);
  check(filename, String);
  check(userId, String);
  check(success, Boolean);

  if (success) {
    check(token, String);
  }

  const selector = {
    meetingId,
    source,
    userId,
    filename,
  };

  const modifier = {
    meetingId,
    source,
    userId,
    filename,
    success,
    token,
  };

  const cb = (err) => {
    if (err) {
      Logger.error(`Inserting upload request: ${err}`);
      return;
    }

    Logger.debug(`Inserting upload request filename=${filename} user=${userId} meeting=${meetingId}`);
  };

  return Upload.upsert(selector, modifier, cb);
}
