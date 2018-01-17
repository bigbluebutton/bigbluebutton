import probe from 'probe-image-size';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import flat from 'flat';
import RedisPubSub from '/imports/startup/server/redis';
import Slides from '/imports/api/slides';
import Logger from '/imports/startup/server/logger';
import { SVG, PNG } from '/imports/utils/mimeTypes';
import calculateSlideData from '/imports/api/slides/server/helpers';

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

const fetchImageSizes = imageUri =>
  probe(imageUri)
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

export default function addSlide(meetingId, presentationId, slide) {
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
  });

  const selector = {
    meetingId,
    presentationId,
    id: slide.id,
  };

  const imageUri = slide.svgUri || slide.pngUri;

  const modifier = {
    $set: Object.assign(
      { meetingId },
      { presentationId },
      flat(slide, { safe: true }),
    ),
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding slide to collection: ${err}`);
    }

    const { insertedId } = numChanged;

    requestWhiteboardHistory(meetingId, slide.id);

    if (insertedId) {
      return Logger.info(`Added slide id=${slide.id} to presentation=${presentationId}`);
    }

    return Logger.info(`Upserted slide id=${slide.id} to presentation=${presentationId}`);
  };

  return fetchImageSizes(imageUri)
    .then(({ width, height }) => {
      // there is a rare case when for a very long not-active meeting
      // the presentation files just disappear
      // in that case just set the whole calculatedData to undefined
      if (!width && !height) {
        modifier.$set.calculatedData = undefined;
        return Slides.upsert(selector, modifier, cb);
      }

      // pre-calculating the width, height, and vieBox coordinates / dimensions
      // to unload the client-side
      const slideData = {
        width,
        height,
        xOffset: modifier.$set.xOffset,
        yOffset: modifier.$set.yOffset,
        widthRatio: modifier.$set.widthRatio,
        heightRatio: modifier.$set.heightRatio,
      };
      modifier.$set.calculatedData = calculateSlideData(slideData);
      modifier.$set.calculatedData.imageUri = imageUri;
      modifier.$set.calculatedData.width = width;
      modifier.$set.calculatedData.height = height;

      return Slides.upsert(selector, modifier, cb);
    })
    .catch(reason =>
      Logger.error(`Error parsing image size. ${reason}. slide=${slide.id} uri=${imageUri}`));
}
