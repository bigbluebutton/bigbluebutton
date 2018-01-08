import Acl from '/imports/startup/acl';
import { getMultiUserStatus } from '/imports/api/common/server/helpers';
import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export default function clearWhiteboard(credentials, whiteboardId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ClearWhiteboardPubMsg';

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);
  check(whiteboardId, String);

  const allowed = Acl.can('methods.clearWhiteboard', credentials) || getMultiUserStatus(meetingId);
  if (!allowed) {
    throw new Meteor.Error(
      'not-allowed', `User ${requesterUserId} is not allowed to clear the whiteboard`,
    );
  }

  const payload = {
    whiteboardId,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
