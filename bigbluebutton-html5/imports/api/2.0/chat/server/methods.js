import mapToAcl from '/imports/startup/mapToAcl';
import { Meteor } from 'meteor/meteor';
import sendChat from './methods/sendChat';
import clearPublicChatHistory from './methods/clearPublicChatHistory';

Meteor.methods(mapToAcl(['methods.sendChat', 'methods.clearPublicChatHistory'], {
  sendChat,
  clearPublicChatHistory,
}));
