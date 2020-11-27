import { HTTP } from 'meteor/http';
import { check } from 'meteor/check';
import Presentations from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';
import flat from 'flat';
import addSlide from '/imports/api/slides/server/modifiers/addSlide';
import setCurrentPresentation from './setCurrentPresentation';

const getSlideText = async (url) => {
  let content = '';
  try {
    content = await HTTP.get(url).content;
  } catch (error) {
    Logger.error(`No file found. ${error}`);
  }
  return content;
};

const addSlides = (meetingId, podId, presentationId, slides) => {
  slides.forEach(async (slide) => {
    const content = await getSlideText(slide.txtUri);

    Object.assign(slide, { content });

    addSlide(meetingId, podId, presentationId, slide);
  });
};

export default function addPresentation(meetingId, podId, presentation) {
  check(meetingId, String);
  check(podId, String);
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
    podId,
    id: presentation.id,
  };

  const modifier = {
    $set: Object.assign({
      meetingId,
      podId,
      'conversion.done': true,
      'conversion.error': false,
    }, flat(presentation, { safe: true })),
  };

  try {
    const { insertedId } = Presentations.upsert(selector, modifier);

    addSlides(meetingId, podId, presentation.id, presentation.pages);
    
    if (insertedId) {
      if (presentation.current) {
        setCurrentPresentation(meetingId, podId, presentation.id);
        Logger.info(`Added presentation id=${presentation.id} meeting=${meetingId}`);
      } else {
        Logger.info(`Upserted presentation id=${presentation.id} meeting=${meetingId}`);
      }
    }
  } catch (err) {
    Logger.error(`Adding presentation to collection: ${err}`);
  }
}
