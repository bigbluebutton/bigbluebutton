import { Meteor } from 'meteor/meteor';
import sendChatMessage from './methods/sendChatMessage';

Meteor.methods({
  sendChatMessage,
  sendChatMessagetoServer: sendChatMessage, // legacy
});
