import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings/';

export default function modifyWBMode(meetingId, whiteboardMode) {
  check(meetingId, String);
  check(whiteboardMode, Object);

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: whiteboardMode,
  };

  try {
    Meetings.update(selector, modifier);
    Logger.info(`Updated whiteboard style flag=${whiteboardMode} for meeting=${meetingId}`);
  } catch (err) {
    Logger.error(`Error while adding an entry to whiteboard style collection: ${err}`);
  }
}
