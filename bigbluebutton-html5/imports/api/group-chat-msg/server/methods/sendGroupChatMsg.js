import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';

import { extractCredentials, parseMessage } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';

export default function sendGroupChatMsg(chatId, message) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SendGroupChatMessageMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(chatId, String);
    check(message, Object);
    const parsedMessage = parseMessage(message.message);
    message.message = parsedMessage;

    const payload = {
      msg: message,
      chatId,
    };

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method sendGroupChatMsg ${err.stack}`);
  }
}
