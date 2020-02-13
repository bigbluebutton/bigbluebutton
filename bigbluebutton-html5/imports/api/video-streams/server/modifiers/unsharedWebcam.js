import Logger from '/imports/startup/server/logger';
import VideoStreams from '/imports/api/video-streams';
import { check } from 'meteor/check';
import { getDeviceId } from '/imports/api/video-streams/server/helpers';

export default function unsharedWebcam(meetingId, userId, stream) {
  check(meetingId, String);
  check(userId, String);
  check(stream, String);

  const deviceId = getDeviceId(stream);

  const selector = {
    meetingId,
    userId,
    deviceId,
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Error removing stream: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Removed stream=${stream} meeting=${meetingId}`);
    }
  };

  return VideoStreams.remove(selector, cb);
}
