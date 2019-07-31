import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';

export default function startUserTyping(credentials, chatId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UserTypingPubMsg';
  const CHAT_CONFIG = Meteor.settings.public.chat;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(chatId, String);

  const payload = {
    chatId: chatId || PUBLIC_GROUP_CHAT_ID,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
