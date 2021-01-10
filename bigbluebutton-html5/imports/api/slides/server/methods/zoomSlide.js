import Presentations from '/imports/api/presentations';
import { Slides } from '/imports/api/slides';
import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function zoomSlide(slideNumber, podId, widthRatio, heightRatio, x, y) { // TODO-- send presentationId and SlideId
  const REDIS_CONFIG = Meteor.settings.private.redis;

  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ResizeAndMovePagePubMsg';
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

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
