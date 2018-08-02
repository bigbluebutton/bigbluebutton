import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import sendGroupChatMsg from './methods/sendGroupChatMsg';
import clearPublicChatHistory from './methods/clearPublicChatHistory';

Meteor.methods(mapToAcl(['methods.sendGroupChatMsg', 'methods.clearPublicChatHistory'], {
  sendGroupChatMsg,
  clearPublicChatHistory,
}));
