import { Slides, SlidePositions } from '/imports/api/slides';
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

  const whiteboardIds = Slides.find(selector, { fields: { id: 1 } }).map(row => row.id);

  try {
    SlidePositions.remove(selector);

    const numberAffected = Slides.remove(selector);

    if (numberAffected) {
      whiteboardIds.forEach(whiteboardId => clearAnnotations(meetingId, whiteboardId));

      Logger.info(`Removed Slides where presentationId=${presentationId}`);
    }
  } catch (err) {
    Logger.error(`Removing Slides from collection: ${err}`);
    return;
  }
}
