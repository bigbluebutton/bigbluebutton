import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import { CHAT_ACCESS_PRIVATE } from '/imports/api/group-chat';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';

export default function createGroupChat(receiver, senderId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'CreateGroupChatReqMsg';

  try {
    senderId && check(senderId, String);
    const { meetingId, requesterUserId } = extractCredentials(this.userId ? this.userId : senderId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(receiver, Object);

    const payload = {
      correlationId: `${requesterUserId}-${Date.now()}`,
      msg: [],
      users: [receiver.userId],
      access: CHAT_ACCESS_PRIVATE,
    };

    return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method createGroupChat ${err.stack}`);
  }
}
