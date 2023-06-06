import { check } from 'meteor/check';
import { Slides } from '/imports/api/slides';
import Logger from '/imports/startup/server/logger';

export default async function changeCurrentSlide(meetingId, podId, presentationId, slideId) {
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
    },
  };

  const oldSlide = await Slides.findOneAsync(oldCurrent.selector);
  const newSlide = await Slides.findOneAsync(newCurrent.selector);

  // if the oldCurrent and newCurrent have the same ids
  if (oldSlide && newSlide && (oldSlide._id === newSlide._id)) {
    return;
  }

  if (newSlide) {
    await Slides.updateAsync(newSlide._id, newCurrent.modifier, newCurrent.callback);
  }

  if (oldSlide) {
    await Slides.updateAsync(oldSlide._id, oldCurrent.modifier, oldCurrent.callback);
  }
}
