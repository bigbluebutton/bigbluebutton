import probe from 'probe-image-size';
import { check } from 'meteor/check';
import Slides from '/imports/api/slides';
import Logger from '/imports/startup/server/logger';

export default function resizeSlide(meetingId, presentationId, slideId, slide) {
  check(meetingId, String);
  check(presentationId, String);
  check(slideId, String);
  check(slide, Object);

  const selector = {
    meetingId,
    presentationId,
    'slide.id': slideId,
  };

  const modifier = {
    $set: {
      slide: {
        width_ratio: slide.width_ratio,
        height_ratio: slide.height_ratio,
        x_offset: slide.x_offset,
        y_offset: slide.y_offset,
      },
    },
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Resizing slide id=${slideId}: ${err}`);
    }

    return Logger.info(`Resized slide id=${slideId}`);
  };

  return Slides.update(selector, modifier, cb);
};
