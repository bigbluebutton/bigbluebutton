import { check } from 'meteor/check';
import { SlidePositions } from '/imports/api/slides';
import Logger from '/imports/startup/server/logger';
import calculateSlideData from '/imports/api/slides/server/helpers';

export default function resizeSlide(meetingId, slide) {
  check(meetingId, String);

  const {
    podId,
    presentationId,
    pageId,
    widthRatio,
    heightRatio,
    xOffset,
    yOffset,
  } = slide;

  const selector = {
    meetingId,
    podId,
    presentationId,
    id: pageId,
  };

  // fetching the current slide data
  // and pre-calculating the width, height, and vieBox coordinates / sizes
  // to reduce the client-side load
  const SlidePosition = SlidePositions.findOne(selector);

  if (SlidePosition) {
    const {
      width,
      height,
    } = SlidePosition;

    const slideData = {
      width,
      height,
      xOffset,
      yOffset,
      widthRatio,
      heightRatio,
    };
    const calculatedData = calculateSlideData(slideData);

    const modifier = {
      $set: calculatedData,
    };

    try {
      const numberAffected = SlidePositions.update(selector, modifier);

      if (numberAffected) {
        Logger.debug(`Resized slide positions id=${pageId}`);
      } else {
        Logger.info(`No slide positions found with id=${pageId}`);
      }
    } catch (err) {
      Logger.error(`Resizing slide positions id=${pageId}: ${err}`);
    }
  }
}
