import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import createGroupChat from './methods/createGroupChat';
import destroyGroupChat from './methods/destroyGroupChat';

Meteor.methods(mapToAcl(['methods.createGroupChat', 'methods.destroyGroupChat'], {
  createGroupChat,
  destroyGroupChat,
}));
