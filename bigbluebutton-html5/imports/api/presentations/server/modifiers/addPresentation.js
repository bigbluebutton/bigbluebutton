import { check } from 'meteor/check';
import Presentations from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';
import flat from 'flat';

import addSlide from '/imports/api/slides/server/modifiers/addSlide';
import setCurrentPresentation from './setCurrentPresentation';

const addSlides = (meetingId, presentationId, slides) => {
  const slidesAdded = [];

  slides.forEach((slide) => {
    slidesAdded.push(addSlide(meetingId, presentationId, slide));
  });

  return slidesAdded;
};

export default function addPresentation(meetingId, presentation) {
  check(presentation, {
    id: String,
    name: String,
    current: Boolean,
    pages: [
      {
        id: String,
        num: Number,
        thumbUri: String,
        swfUri: String,
        txtUri: String,
        svgUri: String,
        current: Boolean,
        xOffset: Number,
        yOffset: Number,
        widthRatio: Number,
        heightRatio: Number,
      },
    ],
    downloadable: Boolean,
  });

  const selector = {
    meetingId,
    id: presentation.id,
  };

  const modifier = {
    $set: Object.assign({
      meetingId,
      'conversion.done': true,
      'conversion.error': false,
    }, flat(presentation, { safe: true })),
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding presentation to collection: ${err}`);
    }

    addSlides(meetingId, presentation.id, presentation.pages);

    const { insertedId } = numChanged;
    if (insertedId) {
      if (presentation.current) {
        setCurrentPresentation(meetingId, presentation.id);
      }

      return Logger.info(`Added presentation id=${presentation.id} meeting=${meetingId}`);
    }

    return Logger.info(`Upserted presentation id=${presentation.id} meeting=${meetingId}`);
  };

  return Presentations.upsert(selector, modifier, cb);
}
