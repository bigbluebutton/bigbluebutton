import Presentations from '/imports/api/presentations';
import { Slides } from '/imports/api/slides';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';

export default async function switchSlide(slideNumber, podId) {
  // TODO-- send presentationId and SlideId
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SetCurrentPagePubMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(slideNumber, Number);
    check(podId, String);

    const selector = {
      meetingId,
      podId,
      current: true,
    };

    const Presentation = await Presentations.findOneAsync(selector);

    if (!Presentation) {
      throw new Meteor.Error('presentation-not-found', 'You need a presentation to be able to switch slides');
    }

    const Slide = await Slides.findOneAsync({
      meetingId,
      podId,
      presentationId: Presentation.id,
      num: slideNumber,
    });

    if (!Slide) {
      throw new Meteor.Error('slide-not-found', `Slide number ${slideNumber} not found in the current presentation`);
    }

    const payload = {
      podId,
      presentationId: Presentation.id,
      pageId: Slide.id,
    };

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method switchSlide ${err.stack}`);
  }
}
