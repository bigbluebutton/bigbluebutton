import { check } from 'meteor/check';
import Presentations from './../../';
import Logger from '/imports/startup/server/logger';

import addSlide from '/imports/api/1.1/slides/server/modifiers/addSlide';

const addSlides = (meetingId, presentationId, slides) => {
  const slidesAdded = [];

  slides.forEach((slide) => {
    slidesAdded.push(addSlide(meetingId, presentationId, slide));
  });

  return slidesAdded;
};

export default function addPresentation(meetingId, presentation) {
  check(meetingId, String);
  check(presentation, Object);

  const selector = {
    meetingId,
    'presentation.id': presentation.id,
  };

  const modifier = {
    $set: {
      meetingId,
      'presentation.id': presentation.id,
      'presentation.name': presentation.name,
      'presentation.current': presentation.current,
      'conversion.error': false,
      'conversion.done': true,
      'upload.date': new Date(),
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`Adding presentation to collection: ${err}`);
      return;
    }

    addSlides(meetingId, presentation.id, presentation.pages);

    const { insertedId } = numChanged;
    if (insertedId) {
      Logger.info(`Added presentation id=${presentation.id} meeting=${meetingId}`);
    }

    if (numChanged) {
      Logger.info(`Upserted presentation id=${presentation.id} meeting=${meetingId}`);
    }
  };

  return Presentations.upsert(selector, modifier, cb);
}
