import { Meteor } from 'meteor/meteor';
import clearPublicChatHistory from './methods/clearPublicChatHistory';
import startUserTyping from './methods/startUserTyping';
import stopUserTyping from './methods/stopUserTyping';

Meteor.methods({
  clearPublicChatHistory,
  startUserTyping,
  stopUserTyping,
});
