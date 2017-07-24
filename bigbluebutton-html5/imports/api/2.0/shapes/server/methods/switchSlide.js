import Presentations from '/imports/api/2.0/presentations';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis2x';
import Slides from '/imports/api/2.0/slides/';

export default function switchSlide(credentials, slideNumber) {
  const REDIS_CONFIG = Meteor.settings.redis;

  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SetCurrentPagePubMsg';

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);
  check(slideNumber, Number);

  const Presentation = Presentations.findOne({
    meetingId,
    'presentation.current': true,
  });

  if (!Presentation) {
    throw new Meteor.Error(
      'presentation-not-found', 'You need a presentation to be able to switch slides');
  }

  const selector = {
    meetingId,
    presentationId: Presentation.presentation.id,
    num: slideNumber,
  };

  const Slide = Slides.findOne(selector);

  if (!Slide) {
    throw new Meteor.Error(
      'slide-not-found', `Slide number ${slideNumber} not found in the current presentation`);
  }

  const header = {
    name: EVENT_NAME,
    meetingId,
    userId: requesterUserId,
  };

  const payload = {
    pageId: Slide.slide.id,
    presentationId: Presentation.presentation.id,
  };

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, meetingId, payload, header);
}
