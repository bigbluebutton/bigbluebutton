import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
// import { isAllowedTo } from '/imports/startup/server/userPermissions';
import Presentations from '/imports/api/1.1/presentations';

export default function publishCursorUpdate(credentials, coordinates) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toBBBApps.presentation;
  const EVENT_NAME = 'send_cursor_update';

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);
  check(coordinates, {
    xPercent: Number,
    yPercent: Number,
  });

  // if (!isAllowedTo('moveCursor', credentials)) {
  //   throw new Meteor.Error('not-allowed', `You are not allowed to move the Cursor`);
  // }

  const Presentation = Presentations.findOne({
    meetingId,
    'presentation.current': true,
  });

  if (!Presentation) {
    throw new Meteor.Error(
      'presentation-not-found', 'You need a presentation to be able to move the cursor');
  }

  const payload = {
    x_percent: coordinates.xPercent,
    meeting_id: meetingId,
    y_percent: coordinates.yPercent,
  };

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, payload);
}
