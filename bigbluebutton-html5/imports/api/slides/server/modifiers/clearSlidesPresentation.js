import Slides from '/imports/api/slides';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import clearAnnotations from '/imports/api/annotations/server/modifiers/clearAnnotations';

export default function clearSlidesPresentation(meetingId, presentationId) {
  check(meetingId, String);
  check(presentationId, String);

  const selector = {
    meetingId,
    presentationId,
  };

  const whiteboardIds = Slides.find(selector).map(row => row.id);

  const cb = (err) => {
    if (err) {
      return Logger.error(`Removing Slides from collection: ${err}`);
    }

    whiteboardIds.forEach(whiteboardId => clearAnnotations(meetingId, whiteboardId));

    return Logger.info(`Removed Slides where presentationId=${presentationId}`);
  };

  return Slides.remove(selector, cb);
}
