import probe from 'probe-image-size';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Slides from '/imports/api/2.0/slides';
import Logger from '/imports/startup/server/logger';
import { SVG, PNG } from '/imports/utils/mimeTypes';

const requestWhiteboardHistory = (meetingId, slideId) => {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toBBBApps.whiteboard;
  const EVENT_NAME = 'request_whiteboard_annotation_history_request';

  const payload = {
    meeting_id: meetingId,
    requester_id: 'nodeJSapp',
    whiteboard_id: slideId,
    reply_to: `${meetingId}/nodeJSapp`,
  };

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, payload);
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
  check(meetingId, String);
  check(presentationId, String);
  check(slide, Object);

  const selector = {
    meetingId,
    presentationId,
    'slide.id': slide.id,
  };

  const imageUri = slide.svgUri || slide.pngUri;

  const modifier = {
    $set: {
      meetingId,
      presentationId,
      slide: {
        id: slide.id,
        num: slide.num,
        thumb_uri: slide.thumbUri,
        swf_uri: slide.swfUri,
        txt_uri: slide.txtUri,
        // svgUri or pngUri is represented by imageUri
        current: slide.current,
        x_offset: slide.xOffset,
        y_offset: slide.yOffset,
        width_ratio: slide.widthRatio,
        height_ratio: slide.heightRatio,
        img_uri: imageUri,

        // width and height are additionally calculated, they are not received
        width: slide.width,
        height: slide.height,
      },
    },
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

    if (numChanged) {
      return Logger.info(`Upserted slide id=${slide.id} to presentation=${presentationId}`);
    }
  };

  return fetchImageSizes(imageUri)
    .then(({ width, height }) => {
      modifier.$set.slide.width = width;
      modifier.$set.slide.height = height;

      return Slides.upsert(selector, modifier, cb);
    })
    .catch(reason =>
      Logger.error(`Error parsing image size. ${reason}. slide=${slide.id} uri=${imageUri}`));
}
