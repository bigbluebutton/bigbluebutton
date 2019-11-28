import { Meteor } from 'meteor/meteor';
import sendGroupChatMsg from './methods/sendGroupChatMsg';
import clearPublicChatHistory from './methods/clearPublicChatHistory';
import startUserTyping from './methods/startUserTyping';
import stopUserTyping from './methods/stopUserTyping';

Meteor.methods({
  sendGroupChatMsg,
  clearPublicChatHistory,
  startUserTyping,
  stopUserTyping,
});
