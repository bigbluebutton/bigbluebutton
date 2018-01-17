import Acl from '/imports/startup/acl';
import { getMultiUserStatus } from '/imports/api/common/server/helpers';
import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Annotations from '/imports/api/annotations';

function isLastMessage(annotation, userId) {
  const DRAW_END = Meteor.settings.public.whiteboard.annotations.status.end;

  if (annotation.status === DRAW_END) {
    const selector = {
      id: annotation.id,
      userId,
    };

    const _annotation = Annotations.findOne(selector);
    return _annotation !== null;
  }

  return false;
}

export default function sendAnnotation(credentials, annotation) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SendWhiteboardAnnotationPubMsg';

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);
  check(annotation, Object);

  // We allow messages to pass through in 3 cases:
  // 1. When it's a standard message in presenter mode (Acl check)
  // 2. When it's a standard message in multi-user mode (getMultUserStatus check)
  // 3. When it's the last message, happens when the user is currently drawing
  // and then slide/presentation changes, the user lost presenter rights,
  // or multi-user whiteboard gets turned off
  // So we allow the last "DRAW_END" message to pass through, to finish the shape.
  const allowed = Acl.can('methods.sendAnnotation', credentials) ||
    getMultiUserStatus(meetingId) ||
    isLastMessage(annotation, requesterUserId);

  if (!allowed) {
    throw new Meteor.Error('not-allowed', `User ${requesterUserId} is not allowed to send an annotation`);
  }

  const payload = {
    annotation,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
