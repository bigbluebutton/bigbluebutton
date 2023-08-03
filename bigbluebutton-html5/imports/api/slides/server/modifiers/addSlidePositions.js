import { SlidePositions } from '/imports/api/slides';
import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import flat from 'flat';

export default async function addSlidePositions(
  meetingId,
  podId,
  presentationId,
  slideId,
  slidePosition,
) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'AddSlidePositionsPubMsg';

  check(meetingId, String);
  check(podId, String);
  check(presentationId, String);
  check(slideId, String);

  check(slidePosition, {
    width: Number,
    height: Number,
    x: Number,
    y: Number,
    viewBoxWidth: Number,
    viewBoxHeight: Number,
  });

  const selector = {
    meetingId,
    podId,
    presentationId,
    id: slideId,
  };

  const modifier = {
    $set: {
      meetingId,
      podId,
      presentationId,
      id: slideId,
      ...flat(slidePosition),
      safe: true,
    },
  };

  try {
    const { insertedId } = await SlidePositions.upsertAsync(selector, modifier);

    if (insertedId) {
      Logger.info(`Added slide position id=${slideId} pod=${podId} presentation=${presentationId}`);
    } else {
      Logger.info(`Upserted slide position id=${slideId} pod=${podId} presentation=${presentationId}`);
    }

    const {
      width, height, viewBoxWidth, viewBoxHeight,
    } = slidePosition;

    const payload = {
      slideId,
      width,
      height,
      viewBoxWidth,
      viewBoxHeight,
    };

    Logger.info('Sending slide position data to backen');
    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, '', payload);
  } catch (err) {
    Logger.error(`Adding slide position to collection: ${err}`);
  }
}
