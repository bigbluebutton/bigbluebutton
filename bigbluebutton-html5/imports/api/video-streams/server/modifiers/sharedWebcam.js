import Logger from '/imports/startup/server/logger';
import VideoStreams from '/imports/api/video-streams';
import { check } from 'meteor/check';
import {
  getDeviceId,
  getUserName,
} from '/imports/api/video-streams/server/helpers';

export default function sharedWebcam(meetingId, userId, stream) {
  check(meetingId, String);
  check(userId, String);
  check(stream, String);

  const deviceId = getDeviceId(stream);
  const name = getUserName(userId);

  const selector = {
    meetingId,
    userId,
    deviceId,
  };

  const modifier = {
    $set: {
      stream,
      name,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Error setting stream: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Updated stream=${stream} meeting=${meetingId}`);
    }
  };

  return VideoStreams.upsert(selector, modifier, cb);
}
