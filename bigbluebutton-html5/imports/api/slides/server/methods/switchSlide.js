import Presentations from '/imports/api/presentations';
import Slides from '/imports/api/slides';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import { isAllowedTo } from '/imports/startup/server/userPermissions';

export default function switchSlide(credentials, slideNumber) {
  const REDIS_CONFIG = Meteor.settings.redis;

  const CHANNEL = REDIS_CONFIG.channels.toBBBApps.presentation;
  const EVENT_NAME = 'go_to_slide';

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);
  check(slideNumber, Number);

  if (!isAllowedTo('switchSlide', credentials)) {
    throw new Meteor.Error('not-allowed', `You are not allowed to switchSlide`);
  }

  const Presentation = Presentations.findOne({
    meetingId,
    'presentation.current': true,
  });

  if (!Presentation) {
    throw new Meteor.Error(
      'presentation-not-found', `You need a presentation to be able to switch slides`);
  }

  const Slide = Slides.findOne({
    meetingId,
    presentationId: Presentation.presentation.id,
    'slide.num': parseInt(slideNumber),
  });

  if (!Slide) {
    throw new Meteor.Error(
      'slide-not-found', `Slide number ${slideNumber} not found in the current presentation`);
  }

  let payload = {
    page: Slide.slide.id,
    meeting_id: meetingId,
  };

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, payload);
};
