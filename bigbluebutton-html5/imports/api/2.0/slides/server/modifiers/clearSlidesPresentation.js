import Slides from '/imports/api/2.0/slides';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import clearAnnotationsWhiteboard from '/imports/api/2.0/annotation/server/modifiers/clearAnnotationsWhiteboard';

export default function clearSlidesPresentation(meetingId, presentationId) {
  check(meetingId, String);
  check(presentationId, String);

  const selector = {
    meetingId,
    presentationId,
  };

  const whiteboardIds = Slides.find(selector).map(row => row.id);

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Removing Slides from collection: ${err}`);
    }

    if (numChanged) {
      whiteboardIds.forEach(whiteboardId => clearAnnotationsWhiteboard(meetingId, whiteboardId));

      return Logger.info(`Removed Slides where presentationId=${presentationId}`);
    }
  };

  return Slides.remove(selector, cb);
}
