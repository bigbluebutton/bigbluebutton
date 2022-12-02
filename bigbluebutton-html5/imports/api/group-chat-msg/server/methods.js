import { Meteor } from 'meteor/meteor';
import sendGroupChatMsg from './methods/sendGroupChatMsg';
import clearPublicChatHistory from './methods/clearPublicChatHistory';
import startUserTyping from './methods/startUserTyping';
import stopUserTyping from './methods/stopUserTyping';
import chatMessageBeforeJoinCounter from './methods/chatMessageBeforeJoinCounter';
import fetchMessagePerPage from './methods/fetchMessagePerPage';
import addMessageReaction from '/imports/api/group-chat-msg/server/methods/addMessageReaction';
import undoMessageReaction from '/imports/api/group-chat-msg/server/methods/undoMessageReaction';

Meteor.methods({
  fetchMessagePerPage,
  chatMessageBeforeJoinCounter,
  sendGroupChatMsg,
  clearPublicChatHistory,
  startUserTyping,
  stopUserTyping,
  addMessageReaction,
  undoMessageReaction,
});
