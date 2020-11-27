import probe from 'probe-image-size';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import flat from 'flat';
import RedisPubSub from '/imports/startup/server/redis';
import { Slides } from '/imports/api/slides';
import Logger from '/imports/startup/server/logger';
import { SVG, PNG } from '/imports/utils/mimeTypes';
import calculateSlideData from '/imports/api/slides/server/helpers';
import addSlidePositions from './addSlidePositions';

const loadSlidesFromHttpAlways = Meteor.settings.private.app.loadSlidesFromHttpAlways || false;

const requestWhiteboardHistory = (meetingId, slideId) => {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'GetWhiteboardAnnotationsReqMsg';
  const USER_ID = 'nodeJSapp';

  const payload = {
    whiteboardId: slideId,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, USER_ID, payload);
};

const SUPPORTED_TYPES = [SVG, PNG];

const fetchImageSizes = imageUri => probe(imageUri)
  .then((result) => {
    if (!SUPPORTED_TYPES.includes(result.mime)) {
      throw new Meteor.Error('invalid-image-type', `received ${result.mime} expecting ${SUPPORTED_TYPES.join()}`);
    }

    return {
      width: result.width,
      height: result.height,
    };
  })
  .catch((reason) => {
    Logger.error(`Error parsing image size. ${reason}. uri=${imageUri}`);
    return reason;
  });

export default function addSlide(meetingId, podId, presentationId, slide) {
  check(podId, String);
  check(presentationId, String);

  check(slide, {
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
    content: String,
  });

  const {
    id: slideId,
    xOffset,
    yOffset,
    widthRatio,
    heightRatio,
    ...restSlide
  } = slide;

  const selector = {
    meetingId,
    podId,
    presentationId,
    id: slideId,
  };

  const imageUri = slide.svgUri || slide.pngUri;

  const modifier = {
    $set: Object.assign(
      { meetingId },
      { podId },
      { presentationId },
      { id: slideId },
      { imageUri },
      flat(restSlide),
      { safe: true },
    ),
  };

  const imageSizeUri = (loadSlidesFromHttpAlways ? imageUri.replace(/^https/i, 'http') : imageUri);

  return fetchImageSizes(imageSizeUri)
    .then(({ width, height }) => {
      // there is a rare case when for a very long not-active meeting the presentation
      // files just disappear and width/height can't be retrieved
      if (width && height) {
        // pre-calculating the width, height, and vieBox coordinates / dimensions
        // to unload the client-side
        const slideData = {
          width,
          height,
          xOffset,
          yOffset,
          widthRatio,
          heightRatio,
        };
        const slidePosition = calculateSlideData(slideData);

        addSlidePositions(meetingId, podId, presentationId, slideId, slidePosition);
      }

      try {
        const { insertedId, numberAffected } = Slides.upsert(selector, modifier);

        requestWhiteboardHistory(meetingId, slideId);

        if (insertedId) {
          Logger.info(`Added slide id=${slideId} pod=${podId} presentation=${presentationId}`);
        } else if (numberAffected) {
          Logger.info(`Upserted slide id=${slideId} pod=${podId} presentation=${presentationId}`);
        }

      } catch (err) {
        Logger.error(`Error on adding slide to collection: ${err}`);
      }
    })
    .catch(reason => Logger.error(`Error parsing image size. ${reason}. slide=${slideId} uri=${imageUri}`));
}
