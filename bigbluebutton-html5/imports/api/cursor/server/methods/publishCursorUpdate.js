import { getMultiUserStatus } from '/imports/api/common/server/helpers';
import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import isPodPresenter from '/imports/api/presentation-pods/server/utils/isPodPresenter';

export default function publishCursorUpdate(credentials, payload) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SendCursorPositionPubMsg';

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);
  check(payload, {
    xPercent: Number,
    yPercent: Number,
    whiteboardId: String,
  });

  const { whiteboardId } = payload;

  const allowed = isPodPresenter(meetingId, whiteboardId, requesterUserId)
    || getMultiUserStatus(meetingId, whiteboardId);
  if (!allowed) {
    throw new Meteor.Error('not-allowed', `User ${requesterUserId} is not allowed to move the cursor`);
  }

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
