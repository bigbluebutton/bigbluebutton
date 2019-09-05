import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import { CHAT_ACCESS_PRIVATE } from '/imports/api/group-chat';


export default function createGroupChat(credentials, receiver) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'CreateGroupChatReqMsg';

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);
  check(receiver, Object);

  const payload = {
    correlationId: `${requesterUserId}-${Date.now()}`,
    msg: [],
    users: [receiver.userId],
    access: CHAT_ACCESS_PRIVATE,
    name: receiver.name,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
