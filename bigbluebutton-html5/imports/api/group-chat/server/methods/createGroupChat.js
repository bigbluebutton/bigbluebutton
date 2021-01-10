import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import { CHAT_ACCESS_PRIVATE } from '/imports/api/group-chat';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function createGroupChat(receiver) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'CreateGroupChatReqMsg';

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

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
