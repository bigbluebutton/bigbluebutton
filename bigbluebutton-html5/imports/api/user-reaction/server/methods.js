import { Meteor } from 'meteor/meteor';
import setUserReaction from './methods/setUserReaction';
import clearAllUsersReaction from './methods/clearAllUsersReaction';

Meteor.methods({
  setUserReaction,
  clearAllUsersReaction,
});
