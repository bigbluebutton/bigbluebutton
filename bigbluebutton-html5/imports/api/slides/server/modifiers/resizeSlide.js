import { check } from 'meteor/check';
import Slides from '/imports/api/slides';
import Logger from '/imports/startup/server/logger';
import calculateSlideData from '/imports/api/slides/server/helpers';

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

  // fetching the current slide data
  // and pre-calculating the width, height, and vieBox coordinates / sizes
  // to reduce the client-side load
  const Slide = Slides.findOne(selector);
  const slideData = {
    width: Slide.calculatedData.width,
    height: Slide.calculatedData.height,
    xOffset,
    yOffset,
    widthRatio,
    heightRatio,
  };
  const calculatedData = calculateSlideData(slideData);
  calculatedData.imageUri = Slide.calculatedData.imageUri;
  calculatedData.width = Slide.calculatedData.width;
  calculatedData.height = Slide.calculatedData.height;
  modifier.$set.calculatedData = calculatedData;

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
