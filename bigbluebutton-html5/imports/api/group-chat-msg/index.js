import { Meteor } from 'meteor/meteor';

const GroupChatMsg = new Mongo.Collection('group-chat-msg');

if (Meteor.isServer) {
  GroupChatMsg._ensureIndex({ meetingId: 1, chatId: 1 });
}

export default GroupChatMsg;

export const CHAT_ACCESS = {
  PUBLIC: 'PUBLIC_ACCESS',
  PRIVATE: 'PRIVATE_ACCESS',
};

export const CHAT_ACCESS_PUBLIC = CHAT_ACCESS.PUBLIC;
export const CHAT_ACCESS_PRIVATE = CHAT_ACCESS.PRIVATE;
export const GROUP_MESSAGE_PUBLIC_ID = 'MAIN-PUBLIC-GROUP-CHAT';
