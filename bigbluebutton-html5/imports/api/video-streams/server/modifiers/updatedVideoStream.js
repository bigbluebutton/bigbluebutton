import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import VideoStreams from '/imports/api/video-streams';
import flat from 'flat';

export default async function updateVideoStream(meetingId, videoStream) {
  check(meetingId, String);
  check(videoStream, {
    userId: String,
    stream: String,
    name: String,
    pin: Boolean,
    floor: Boolean,
    lastFloorTime: String,
  });

  const { userId, stream } = videoStream;

  const selector = {
    meetingId,
    stream,
    userId,
  };

  const modifier = {
    $set: Object.assign(
      flat(videoStream),
    ),
  };

  try {
    const numberAffected = await VideoStreams.updateAsync(selector, modifier);

    if (numberAffected) {
      Logger.debug(`Update videoStream ${stream} for user ${userId} in ${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Error update videoStream ${stream} for user=${userId}: ${err}`);
  }
}
