import axios from 'axios';
import { check } from 'meteor/check';
import Presentations from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';
import flat from 'flat';
import addSlide from '/imports/api/slides/server/modifiers/addSlide';
import setCurrentPresentation from './setCurrentPresentation';

const getSlideText = async (url) => {
  let content = '';
  try {
    const request = await axios(url);
    content = request.data.toString();
  } catch (error) {
    Logger.error(`No file found. ${error}`);
  }
  return content;
};

const addSlides = (meetingId, podId, presentationId, slides) => {
  slides.forEach(async (slide) => {
    const content = await getSlideText(slide.txtUri);

    Object.assign(slide, { content });

    await addSlide(meetingId, podId, presentationId, slide);
  });
};

export default async function addPresentation(meetingId, podId, presentation) {
  check(meetingId, String);
  check(podId, String);
  check(presentation, {
    id: String,
    name: String,
    current: Boolean,
    temporaryPresentationId: String,
    pages: [
      {
        id: String,
        num: Number,
        thumbUri: String,
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
    removable: Boolean,
    isInitialPresentation: Boolean,
    filenameConverted: String,
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
      'exportation.status': null,
    }, flat(presentation, { safe: true })),
  };

  try {
    await Presentations.upsertAsync(selector, modifier);

    await addSlides(meetingId, podId, presentation.id, presentation.pages);

    if (presentation.current) {
      setCurrentPresentation(meetingId, podId, presentation.id);
      Logger.info(`Added presentation id=${presentation.id} meeting=${meetingId}`);
    } else {
      Logger.info(`Upserted presentation id=${presentation.id} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Adding presentation to collection: ${err}`);
  }
}
