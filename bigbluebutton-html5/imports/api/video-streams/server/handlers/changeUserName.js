import Logger from '/imports/startup/server/logger';
import VideoStreams from '/imports/api/video-streams';
import { check } from 'meteor/check';

export default function changeUserName(payload, meetingId) {
  check(payload.body, Object);
  check(meetingId, String);

  const {
    userId,
    newUserName,
  } = payload.body;

  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      name: newUserName,
    },
  };

  try {
    VideoStreams.update(selector, modifier);
    Logger.info(`Changed name=${newUserName} of video stream because of username change id=${userId} meeting=${meetingId}`);
  } catch (err) {
    Logger.error(`Changed name of video stream: ${err}`);
  }
}
