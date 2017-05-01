import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import Presentations from '/imports/api/presentations';
import Slides from '/imports/api/slides';

export default function clearWhiteboard(credentials) {

  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toBBBApps.whiteboard;
  const EVENT_NAME = 'clear_whiteboard_request';

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  if (!isAllowedTo('clearWhiteboard', credentials)) {
    throw new Meteor.Error('not-allowed', `You are not allowed to clear all annotations`);
  }

  const presentationSelector = {
    meetingId,
    'presentation.current': true,
  };
  const presentationOptions = {
    fields: {
      'presentation.id': 1,
      _id: 0,
    },
  };

  const presentation = Presentations.findOne(presentationSelector, presentationOptions);

  if (!presentation) {
    throw new Meteor.Error(
      'presentation-not-found', `You need an active presentation to be able to clear all annotations`);
  }

  const presentationId = presentation.presentation.id;

  const slideSelector = {
    meetingId,
    presentationId: presentationId,
    'slide.current': true,
  };
  const slideOptions = {
    fields: {
      'slide.id': 1,
      _id: 0,
    },
  };

  const slide = Slides.findOne(slideSelector, slideOptions);

  if (!slide) {
    throw new Meteor.Error(
      'slide-not-found', `You need an active slide to be able to undo the annotation`);
  }

  const whiteboardId = slide.slide.id;

  let payload = {
    requester_id: requesterUserId,
    meeting_id: meetingId,
    whiteboard_id: whiteboardId,
  };

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, payload);
}
