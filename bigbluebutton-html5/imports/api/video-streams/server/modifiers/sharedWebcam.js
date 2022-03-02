import Logger from '/imports/startup/server/logger';
import VideoStreams from '/imports/api/video-streams';
import { check } from 'meteor/check';
import {
  getDeviceId,
  getUserName,
} from '/imports/api/video-streams/server/helpers';
import VoiceUsers from '/imports/api/voice-users/';
import Users from '/imports/api/users/';

const BASE_FLOOR_TIME = "0";

export default function sharedWebcam(meetingId, userId, stream) {
  check(meetingId, String);
  check(userId, String);
  check(stream, String);

  const deviceId = getDeviceId(stream);
  const name = getUserName(userId, meetingId);
  const vu = VoiceUsers.findOne(
    { meetingId, intId: userId },
    { fields: { floor: 1, lastFloorTime: 1 }}
  ) || {};
  const u = Users.findOne(
    { meetingId, intId: userId },
    { fields: { pin: 1 } },
  ) || {};
  const floor = vu.floor || false;
  const pin = u.pin || false;

  const lastFloorTime = vu.lastFloorTime || BASE_FLOOR_TIME;

  const selector = {
    meetingId,
    userId,
    deviceId,
  };

  const modifier = {
    $set: {
      stream,
      name,
      lastFloorTime,
      floor,
      pin,
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

export function addWebcamSync(meetingId, videoStream) {
  check(videoStream, {
    userId: String,
    stream: String,
    name: String,
    pin: Boolean,
    floor: Boolean,
    lastFloorTime: String,
  });

  const {
    stream, userId, name, pin, floor, lastFloorTime,
  } = videoStream;

  const deviceId = getDeviceId(stream);

  const selector = {
    meetingId,
    userId,
    deviceId,
  };

  const modifier = {
    $set: {
      stream,
      name,
      lastFloorTime,
      floor,
      pin,
    },
  };

  try {
    const { insertedId } = VideoStreams.upsert(selector, modifier);

    if (insertedId) {
      Logger.info(`Synced stream=${stream} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Error setting sync stream: ${err}`);
  }
}
