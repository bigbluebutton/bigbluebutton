import probe from 'probe-image-size';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import flat from 'flat';
import RedisPubSub from '/imports/startup/server/redis2x';
import Slides from '/imports/api/2.0/slides';
import Logger from '/imports/startup/server/logger';
import { SVG, PNG } from '/imports/utils/mimeTypes';

const requestWhiteboardHistory = (meetingId, slideId) => {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'GetWhiteboardAnnotationsReqMsg';

  const header = { name: EVENT_NAME, meetingId, userId: 'nodeJSapp' };

  const payload = {
    whiteboardId: slideId,
  };

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, meetingId, payload, header);
};

const SUPPORTED_TYPES = [SVG, PNG];

const fetchImageSizes = imageUri =>
  probe(imageUri)
    .then((result) => {
      if (!SUPPORTED_TYPES.includes(result.mime)) {
        throw `Invalid image type, received ${result.mime} expecting ${SUPPORTED_TYPES.join()}`;
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
      modifier.$set.width = width;
      modifier.$set.height = height;

      return Slides.upsert(selector, modifier, cb);
    })
    .catch(reason =>
      Logger.error(`Error parsing image size. ${reason}. slide=${slide.id} uri=${imageUri}`));
}
