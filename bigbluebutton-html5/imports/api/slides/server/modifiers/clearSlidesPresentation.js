import { Slides, SlidePositions } from '/imports/api/slides';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import clearAnnotations from '/imports/api/annotations/server/modifiers/clearAnnotations';

export default async function clearSlidesPresentation(meetingId, presentationId) {
  check(meetingId, String);
  check(presentationId, String);

  const selector = {
    meetingId,
    presentationId,
  };

  const whiteboardIds = await Slides.find(selector, { fields: { id: 1 } }).mapAsync(row => row.id);

  try {
    await SlidePositions.removeAsync(selector);

    const numberAffected = await Slides.removeAsync(selector);

    if (numberAffected) {
      whiteboardIds.forEach(async (whiteboardId) => clearAnnotations(meetingId, whiteboardId));

      Logger.info(`Removed Slides where presentationId=${presentationId}`);
    }
  } catch (err) {
    Logger.error(`Removing Slides from collection: ${err}`);
  }
}
