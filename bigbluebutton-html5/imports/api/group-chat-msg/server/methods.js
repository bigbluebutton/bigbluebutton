import { Meteor } from 'meteor/meteor';
import clearPublicChatHistory from './methods/clearPublicChatHistory';
import startUserTyping from './methods/startUserTyping';

Meteor.methods({
  clearPublicChatHistory,
  startUserTyping,
});
