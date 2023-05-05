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

  try {
    VideoStreams.remove(selector);

    Logger.info(`Removed stream=${stream} meeting=${meetingId}`);
  } catch (err) {
    Logger.error(`Error removing stream: ${err}`);
  }
}
