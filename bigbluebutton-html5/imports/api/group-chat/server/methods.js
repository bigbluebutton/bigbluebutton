import { Meteor } from 'meteor/meteor';
import createGroupChat from './methods/createGroupChat';
import destroyGroupChat from './methods/destroyGroupChat';

Meteor.methods({
  createGroupChat,
  destroyGroupChat,
});
