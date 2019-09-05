import Logger from '/imports/startup/server/logger';
import VideoUsers from '/imports/api/video-users';
import { check } from 'meteor/check';

export default function sharedWebcam(meetingId, userId, stream) {
  check(meetingId, String);
  check(userId, String);

  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      stream,
      hasStream: true,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Error setting hasStream to true: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Updated hasStream for user id=${userId} meeting=${meetingId}`);
    }
  };

  return VideoUsers.upsert(selector, modifier, cb);
}
