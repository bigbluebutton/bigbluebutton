import probe from 'probe-image-size';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Slides from '/imports/api/slides';
import Logger from '/imports/startup/server/logger';
import { SVG, PNG } from '/imports/utils/mimeTypes';

const requestWhiteboardHistory = (meetingId, slideId) => {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toBBBApps.whiteboard;
  const EVENT_NAME = 'request_whiteboard_annotation_history_request';

  let payload = {
    meeting_id: meetingId,
    requester_id: 'nodeJSapp',
    whiteboard_id: slideId,
    reply_to: `${meetingId}/nodeJSapp`,
  };

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, payload);
};

const SUPPORTED_TYPES = [SVG, PNG];

export default function addSlide(meetingId, presentationId, slide) {
  check(meetingId, String);
  check(presentationId, String);
  check(slide, Object);

  const selector = {
    meetingId,
    presentationId,
    'slide.id': slide.id,
  };

  const imageUri = slide.svg_uri || slide.png_uri;

  const modifier = {
    $set: {
      meetingId,
      presentationId,
      slide: {
        id: slide.id,
        height_ratio: slide.height_ratio,
        y_offset: slide.y_offset,
        num: slide.num,
        x_offset: slide.x_offset,
        current: slide.current,
        img_uri: imageUri,
        txt_uri: slide.txt_uri,
        width_ratio: slide.width_ratio,
        swf_uri: slide.swf_uri,
        thumb_uri: slide.thumb_uri,
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

    if (insertedId) {
      requestWhiteboardHistory(meetingId, slide.id);
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
};

const fetchImageSizes = (imageUri) =>
  probe(imageUri)
  .then(result => {
    if (!SUPPORTED_TYPES.includes(result.mime)) {
      throw `Invalid image type, received ${result.mime} expecting ${SUPPORTED_TYPES.join()}`;
    }

    return {
      width: result.width,
      height: result.height,
    };
  })
  .catch(reason => {
    Logger.error(`Error parsing image size. ${reason}. uri=${imageUri}`);
    return reason;
  });
