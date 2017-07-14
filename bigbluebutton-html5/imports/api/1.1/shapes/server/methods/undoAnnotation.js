import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
// import { isAllowedTo } from '/imports/startup/server/userPermissions';
import Presentations from '/imports/api/1.1/presentations';
import Slides from '/imports/api/1.1/slides';

export default function undoAnnotation(credentials, whiteboardId) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toBBBApps.whiteboard;
  const EVENT_NAME = 'undo_whiteboard_request';

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);
  check(whiteboardId, String);

  // if (!isAllowedTo('undoAnnotation', credentials)) {
  //   throw new Meteor.Error('not-allowed', `You are not allowed to undo the annotation`);
  // }

  const payload = {
    requester_id: requesterUserId,
    meeting_id: meetingId,
    whiteboard_id: whiteboardId,
  };

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, payload);
}
