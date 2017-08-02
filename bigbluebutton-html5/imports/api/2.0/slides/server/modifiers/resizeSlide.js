import { check } from 'meteor/check';
import Slides from '/imports/api/2.0/slides';
import Logger from '/imports/startup/server/logger';

export default function resizeSlide(meetingId, slide) {
  check(meetingId, String);

  const { presentationId } = slide;
  const { pageId, widthRatio, heightRatio, xOffset, yOffset } = slide;

  const selector = {
    meetingId,
    presentationId,
    id: pageId,
  };

  const modifier = {
    $set: {
      widthRatio,
      heightRatio,
      xOffset,
      yOffset,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Resizing slide id=${pageId}: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Resized slide id=${pageId}`);
    }

    return Logger.info(`No slide found with id=${pageId}`);
  };

  return Slides.update(selector, modifier, cb);
}
