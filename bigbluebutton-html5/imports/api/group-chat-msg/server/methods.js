import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import sendGroupChatMsg from './methods/sendGroupChatMsg';

Meteor.methods(mapToAcl(['methods.sendGroupChatMsg'], {
  sendGroupChatMsg,
}));
