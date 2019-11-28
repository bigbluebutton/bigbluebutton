import Presentations from '/imports/api/presentations';
import { Slides } from '/imports/api/slides';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';

export default function zoomSlide(credentials, slideNumber, podId, widthRatio, heightRatio, x, y) {
  const REDIS_CONFIG = Meteor.settings.private.redis;

  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ResizeAndMovePagePubMsg';

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  const selector = {
    meetingId,
    podId,
    current: true,
  };
  const Presentation = Presentations.findOne(selector);

  if (!Presentation) {
    throw new Meteor.Error('presentation-not-found', 'You need a presentation to be able to switch slides');
  }

  const Slide = Slides.findOne({
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
    xOffset: x,
    yOffset: y,
    widthRatio,
    heightRatio,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
