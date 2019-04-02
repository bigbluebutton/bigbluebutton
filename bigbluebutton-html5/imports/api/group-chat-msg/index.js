import { Meteor } from 'meteor/meteor';

const GroupChatMsg = new Mongo.Collection('group-chat-msg');

if (Meteor.isServer) {
  GroupChatMsg._ensureIndex({ meetingId: 1, chatId: 1 });
}

export default GroupChatMsg;
