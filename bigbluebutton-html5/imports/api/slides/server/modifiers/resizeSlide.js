import { check } from 'meteor/check';
import { SlidePositions } from '/imports/api/slides';
import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import calculateSlideData from '/imports/api/slides/server/helpers';

export default async function resizeSlide(meetingId, slide) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SlideResizedPubMsg';

  check(meetingId, String);

  const {
    podId,
    presentationId,
    pageId,
    widthRatio,
    heightRatio,
    xOffset,
    yOffset,
  } = slide;

  const selector = {
    meetingId,
    podId,
    presentationId,
    id: pageId,
  };

  // fetching the current slide data
  // and pre-calculating the width, height, and vieBox coordinates / sizes
  // to reduce the client-side load
  const SlidePosition = await SlidePositions.findOneAsync(selector);

  if (SlidePosition) {
    const {
      width,
      height,
    } = SlidePosition;

    const slideData = {
      width,
      height,
      xOffset,
      yOffset,
      widthRatio,
      heightRatio,
    };
    const calculatedData = calculateSlideData(slideData);

    const modifier = {
      $set: calculatedData,
    };

    try {
      const numberAffected = await SlidePositions.updateAsync(selector, modifier);

      const payload = {
        pageId,
        ...slideData,
      };

      RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, '', payload);

      if (numberAffected) {
        Logger.debug(`Resized slide positions id=${pageId}`);
      } else {
        Logger.info(`No slide positions found with id=${pageId}`);
      }
    } catch (err) {
      Logger.error(`Resizing slide positions id=${pageId}: ${err}`);
    }
  }
}
