import { check } from 'meteor/check';
import { Slides } from '/imports/api/slides';
import Logger from '/imports/startup/server/logger';

export default function changeCurrentSlide(meetingId, podId, presentationId, slideId) {
  check(meetingId, String);
  check(presentationId, String);
  check(slideId, String);
  check(podId, String);

  const oldCurrent = {
    selector: {
      meetingId,
      podId,
      presentationId,
      current: true,
    },
    modifier: {
      $set: { current: false },
    },
    callback: (err) => {
      if (err) {
        Logger.error(`Unsetting the current slide: ${err}`);
        return;
      }

      Logger.info('Unsetted the current slide');
      return;
    },
  };

  const newCurrent = {
    selector: {
      meetingId,
      podId,
      presentationId,
      id: slideId,
    },
    modifier: {
      $set: { current: true },
    },
    callback: (err) => {
      if (err) {
        Logger.error(`Setting as current slide id=${slideId}: ${err}`);
        return;
      }

      Logger.info(`Setted as current slide id=${slideId}`);
      return;
    },
  };

  const oldSlide = Slides.findOne(oldCurrent.selector);
  const newSlide = Slides.findOne(newCurrent.selector);

  // if the oldCurrent and newCurrent have the same ids
  if (oldSlide && newSlide && (oldSlide._id === newSlide._id)) {
    return;
  }

  if (newSlide) {
    Slides.update(newSlide._id, newCurrent.modifier, newCurrent.callback);
  }

  if (oldSlide) {
    Slides.update(oldSlide._id, oldCurrent.modifier, oldCurrent.callback);
  }
}
