import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';

export default function publishCursorUpdate(meetingId, requesterUserId, payload) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SendCursorPositionPubMsg';

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
