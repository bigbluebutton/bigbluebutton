import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import Presentations from '/imports/api/presentations';

export default function publishCursorUpdate(credentials, coordinates) {

  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toBBBApps.presentation;
  const EVENT_NAME = 'send_cursor_update';

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);
  check(coordinates, {
    x_percent: Number,
    y_percent: Number,
  });

  if (!isAllowedTo('moveCursor', credentials)) {
    throw new Meteor.Error('not-allowed', `You are not allowed to move the Cursor`);
  }

  const Presentation = Presentations.findOne({
    meetingId,
    'presentation.current': true,
  });

  if (!Presentation) {
    throw new Meteor.Error(
      'presentation-not-found', `You need a presentation to be able to move the cursor`);
  }

  let payload = {
    x_percent: coordinates.x_percent,
    meeting_id: meetingId,
    y_percent: coordinates.y_percent,
  };

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, payload);
}
