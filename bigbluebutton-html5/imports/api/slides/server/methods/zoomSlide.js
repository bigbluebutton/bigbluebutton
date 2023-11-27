import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default async function zoomSlide(
  slideNumber,
  podId,
  widthRatio,
  heightRatio,
  x,
  y,
  presentationId,
) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ResizeAndMovePagePubMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(slideNumber, Number);
    check(podId, String);
    check(widthRatio, Number);
    check(heightRatio, Number);
    check(x, Number);
    check(y, Number);

    const payload = {
      podId,
      presentationId,
      pageId: `${presentationId}/${slideNumber}`,
      xOffset: x,
      yOffset: y,
      widthRatio,
      heightRatio,
      slideNumber,
    };

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method zoomSlide ${err.stack}`);
  }
}
