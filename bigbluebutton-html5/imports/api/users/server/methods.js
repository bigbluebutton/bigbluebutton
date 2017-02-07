import { Meteor } from 'meteor/meteor';
import kickUser from './methods/kickUser';
import listenOnlyRequestToggle from './methods/listenOnlyRequestToggle';
import userLogout from './methods/userLogout';

Meteor.methods({
  kickUser,
  listenOnlyRequestToggle,
  userLogout,
});
