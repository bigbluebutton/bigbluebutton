import Slides from '/imports/api/slides';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import clearShapesWhiteboard from '/imports/api/shapes/server/modifiers/clearShapesWhiteboard';

export default function clearSlidesPresentation(meetingId, presentationId) {
  check(meetingId, String);
  check(presentationId, String);

  const selector = {
    meetingId,
    presentationId,
  };

  const whiteboardIds = Slides.find(selector).map(row => row.slide.id);

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Removing Slides from collection: ${err}`);
    }

    if (numChanged) {
      whiteboardIds.forEach(whiteboardId => clearShapesWhiteboard(meetingId, whiteboardId));

      return Logger.info(`Removed Slides where presentationId=${presentationId}`);
    }
  };

  return Slides.remove(selector, cb);
};
