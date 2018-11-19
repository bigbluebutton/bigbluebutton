import { Meteor } from 'meteor/meteor';
import sendGroupChatMsg from './methods/sendGroupChatMsg';
import clearPublicChatHistory from './methods/clearPublicChatHistory';

Meteor.methods({
  sendGroupChatMsg,
  clearPublicChatHistory,
});
