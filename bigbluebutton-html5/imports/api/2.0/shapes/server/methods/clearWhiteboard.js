import RedisPubSub from '/imports/startup/server/redis2x';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
// import { isAllowedTo } from '/imports/startup/server/userPermissions';

export default function clearWhiteboard(credentials, whiteboardId) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ClearWhiteboardPubMsg';

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);
  check(whiteboardId, String);

  // if (!isAllowedTo('clearWhiteboard', credentials)) {
  //   throw new Meteor.Error('not-allowed', `You are not allowed to clear all annotations`);
  // }

  const header = {
    name: EVENT_NAME,
    meetingId,
    userId: requesterUserId,
  };

  const payload = {
    whiteboardId,
  };

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, meetingId, payload, header);
}
