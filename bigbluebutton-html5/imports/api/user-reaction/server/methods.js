import { Meteor } from 'meteor/meteor';
import setUserReaction from './methods/setUserReaction';
import clearAllUsersEmoji from './methods/clearAllUsersEmoji';

Meteor.methods({
  setUserReaction,
  clearAllUsersEmoji,
});
