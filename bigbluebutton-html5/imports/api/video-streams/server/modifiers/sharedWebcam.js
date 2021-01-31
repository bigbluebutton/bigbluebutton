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

  try {
    const { insertedId } = VideoStreams.upsert(selector, modifier);

    if (insertedId) {
      Logger.info(`Updated stream=${stream} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Error setting stream: ${err}`);
  }
}
