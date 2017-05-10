import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import Presentations from '/imports/api/presentations';
import Slides from '/imports/api/slides';

export default function clearWhiteboard(credentials, whiteboardId) {

  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toBBBApps.whiteboard;
  const EVENT_NAME = 'clear_whiteboard_request';

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);
  check(whiteboardId, String);

  if (!isAllowedTo('clearWhiteboard', credentials)) {
    throw new Meteor.Error('not-allowed', `You are not allowed to clear all annotations`);
  }

  let payload = {
    requester_id: requesterUserId,
    meeting_id: meetingId,
    whiteboard_id: whiteboardId,
  };

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, payload);
}
