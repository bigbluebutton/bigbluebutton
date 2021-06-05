import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import addSystemMsg from '/imports/api/group-chat-msg/server/modifiers/addSystemMsg';

export default function changeUserName(userId, newUserName, userNameChangedMessage) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ChangeUserNameCmdMsg';
  const CHAT_CONFIG = Meteor.settings.public.chat;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
  const PUBLIC_CHAT_SYSTEM_ID = CHAT_CONFIG.system_userid;
  const USER_NAME_CHANGED_MESSAGE = CHAT_CONFIG.system_messages_keys.chat_username_changed;
  const SYSTEM_CHAT_TYPE = CHAT_CONFIG.type_system;

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(meetingId, String);
  check(requesterUserId, String);
  check(userId, String);
  check(newUserName, String);
  check(userNameChangedMessage, String);

  const payload = {
    userId,
    newUserName,
  };

  const chatMessagePayload = {
    id: `${SYSTEM_CHAT_TYPE}-${USER_NAME_CHANGED_MESSAGE}`,
    timestamp: Date.now(),
    correlationId: `${PUBLIC_CHAT_SYSTEM_ID}-${Date.now()}`,
    sender: {
      id: PUBLIC_CHAT_SYSTEM_ID,
      name: '',
    },
    message: userNameChangedMessage,
    extra: {},
  };

  addSystemMsg(meetingId, PUBLIC_GROUP_CHAT_ID, chatMessagePayload);

  Logger.verbose('Changed user name', {
    userId, newUserName, changedBy: requesterUserId, meetingId,
  });

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
