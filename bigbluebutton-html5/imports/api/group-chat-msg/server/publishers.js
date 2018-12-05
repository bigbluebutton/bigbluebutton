import GroupChatMsg from '/imports/api/group-chat-msg';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import Logger from '/imports/startup/server/logger';

function groupChatMsg(credentials, chatsIds) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  const CHAT_CONFIG = Meteor.settings.public.chat;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;

  Logger.info(`Publishing group-chat-msg for ${meetingId} ${requesterUserId} ${requesterToken}`);

  return GroupChatMsg.find({
    $or: [
      { meetingId, chatId: { $eq: PUBLIC_GROUP_CHAT_ID } },
      { chatId: { $in: chatsIds } },
    ],
  });
}

function publish(...args) {
  const boundGroupChat = groupChatMsg.bind(this);
  return boundGroupChat(...args);
}

Meteor.publish('group-chat-msg', publish);
