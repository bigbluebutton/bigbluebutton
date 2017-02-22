import { Meteor } from 'meteor/meteor';
import kickUser from './methods/kickUser';
import listenOnlyToggle from './methods/listenOnlyToggle';
import userLogout from './methods/userLogout';
import muteUser from './methods/muteUser';

Meteor.methods({
  kickUser,
  listenOnlyToggle,
  userLogout,
  muteUser,
});
