import { GroupChatMsg, UsersTyping } from '/imports/api/group-chat-msg';
import Users from '/imports/api/users';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import GroupChat from '/imports/api/group-chat';
import Logger from '/imports/startup/server/logger';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

function groupChatMsg(chatCount) {
  check(chatCount, Number);
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing GroupChatMsg was requested by unauth connection ${this.connection.id}`);
    return GroupChatMsg.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  const CHAT_CONFIG = Meteor.settings.public.chat;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;

  Logger.debug('Publishing group-chat-msg', { meetingId, userId });

  const chats = GroupChat.find({
    $or: [
      { meetingId, users: { $all: [userId] } },
    ],
  }).fetch();

  const chatsIds = chats.map((ct) => ct.chatId);

  const User = Users.findOne({ userId, meetingId });
  const selector = {
    timestamp: { $gte: User.authTokenValidatedTime },
    $or: [
      { meetingId, chatId: { $eq: PUBLIC_GROUP_CHAT_ID } },
      { meetingId, chatId: { $in: chatsIds } },
    ],
  };
  return GroupChatMsg.find(selector);
}

function publish(...args) {
  const boundGroupChat = groupChatMsg.bind(this);
  return boundGroupChat(...args);
}

Meteor.publish('group-chat-msg', publish);

function usersTyping() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing users-typing was requested by unauth connection ${this.connection.id}`);
    return UsersTyping.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  Logger.debug('Publishing users-typing', { meetingId, userId });

  return UsersTyping.find({ meetingId });
}

function pubishUsersTyping(...args) {
  const boundUsersTyping = usersTyping.bind(this);
  return boundUsersTyping(...args);
}

Meteor.publish('users-typing', pubishUsersTyping);
