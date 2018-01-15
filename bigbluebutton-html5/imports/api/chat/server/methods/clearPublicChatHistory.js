import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';

export default function clearPublicChatHistory(credentials) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  const eventName = 'ClearPublicChatHistoryPubMsg';

  const payload = {};

  return RedisPubSub.publishUserMessage(CHANNEL, eventName, meetingId, requesterUserId, payload);
}
