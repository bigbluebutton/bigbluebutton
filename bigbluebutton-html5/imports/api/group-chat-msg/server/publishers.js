import { GroupChatMsg, UsersTyping } from '/imports/api/group-chat-msg';
import { Meteor } from 'meteor/meteor';

import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

function groupChatMsg(chatsIds) {
  if (!this.userId) {
    return GroupChatMsg.find({ meetingId: '' });
  }
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  const CHAT_CONFIG = Meteor.settings.public.chat;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;

  Logger.debug('Publishing group-chat-msg', { meetingId, requesterUserId });

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

function usersTyping() {
  if (!this.userId) {
    return UsersTyping.find({ meetingId: '' });
  }

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  Logger.debug('Publishing users-typing', { meetingId, requesterUserId });

  return UsersTyping.find({ meetingId });
}

function pubishUsersTyping(...args) {
  const boundUsersTyping = usersTyping.bind(this);
  return boundUsersTyping(...args);
}

Meteor.publish('users-typing', pubishUsersTyping);
