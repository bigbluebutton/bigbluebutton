import Presentations from '/imports/api/presentations';
import Slides from '/imports/api/slides';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';

export default function switchSlide(credentials, slideNumber) {
  const REDIS_CONFIG = Meteor.settings.private.redis;

  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SetCurrentPagePubMsg';

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);
  check(slideNumber, Number);

  const selector = {
    meetingId,
    current: true,
  };

  const Presentation = Presentations.findOne(selector);

  if (!Presentation) {
    throw new Meteor.Error('presentation-not-found', 'You need a presentation to be able to switch slides');
  }

  const Slide = Slides.findOne({
    meetingId,
    presentationId: Presentation.id,
    num: slideNumber,
  });

  if (!Slide) {
    throw new Meteor.Error('slide-not-found', `Slide number ${slideNumber} not found in the current presentation`);
  }

  const payload = {
    pageId: Slide.id,
    presentationId: Presentation.id,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
