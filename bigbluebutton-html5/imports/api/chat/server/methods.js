import { Meteor } from 'meteor/meteor';
import sendChat from './methods/sendChat';
import mapToAcl from '/imports/startup/mapToAcl';

Meteor.methods(mapToAcl({
  sendChat,
}));
