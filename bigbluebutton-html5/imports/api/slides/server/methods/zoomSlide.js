import Presentations from '/imports/api/presentations';
import { Slides } from '/imports/api/slides';
import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default async function zoomSlide(slideNumber, podId, widthRatio, heightRatio, x, y) {
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

    const selector = {
      meetingId,
      podId,
      current: true,
    };
    const Presentation = await Presentations.findOneAsync(selector);

    if (!Presentation) {
      throw new Meteor.Error('presentation-not-found', 'You need a presentation to be able to switch slides');
    }

    let validSlideNum = slideNumber;
    if (validSlideNum > Presentation?.pages?.length) validSlideNum = 1;

    const Slide = await Slides.findOneAsync({
      meetingId,
      podId,
      presentationId: Presentation.id,
      num: validSlideNum,
    });

    if (!Slide) {
      throw new Meteor.Error('slide-not-found', `Slide number ${validSlideNum} not found in the current presentation`);
    }

    const payload = {
      podId,
      presentationId: Presentation.id,
      pageId: Slide.id,
      xOffset: x,
      yOffset: y,
      widthRatio,
      heightRatio,
    };

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method zoomSlide ${err.stack}`);
  }
}
