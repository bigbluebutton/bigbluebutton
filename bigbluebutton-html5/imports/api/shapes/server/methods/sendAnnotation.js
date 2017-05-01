import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import Logger from '/imports/startup/server/logger';

export default function sendAnnotation(credentials, payload) {

  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toBBBApps.whiteboard;
  const EVENT_NAME = 'send_whiteboard_annotation_request';

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  if (!isAllowedTo('sendAnnotation', credentials)) {
    throw new Meteor.Error('not-allowed', `You are not allowed to send the annotation`);
  }

  payload.annotation.id = requesterUserId + "-" + payload.annotation.id;
  payload.requester_id = requesterUserId;
  payload.meeting_id = meetingId;

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, payload);
}
