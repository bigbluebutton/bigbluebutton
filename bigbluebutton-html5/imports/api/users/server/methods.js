import { Meteor } from 'meteor/meteor';
import kickUser from './methods/kickUser';
import listenOnlyToggle from './methods/listenOnlyToggle';
import userLogout from './methods/userLogout';

Meteor.methods({
  kickUser,
  listenOnlyToggle,
  userLogout,
});
