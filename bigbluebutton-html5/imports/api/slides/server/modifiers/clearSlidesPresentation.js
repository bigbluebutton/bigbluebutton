import { Slides, SlidePositions } from '/imports/api/slides';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default async function clearSlidesPresentation(meetingId, presentationId) {
  check(meetingId, String);
  check(presentationId, String);

  const selector = {
    meetingId,
    presentationId,
  };

  try {
    await SlidePositions.removeAsync(selector);

    const numberAffected = await Slides.removeAsync(selector);

    if (numberAffected) {
      Logger.info(`Removed Slides where presentationId=${presentationId}`);
    }
  } catch (err) {
    Logger.error(`Removing Slides from collection: ${err}`);
  }
}
