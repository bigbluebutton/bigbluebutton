import { Meteor } from 'meteor/meteor';
import kickUser from './methods/kickUser';
import listenOnlyToggle from './methods/listenOnlyToggle';
import userLogout from './methods/userLogout';
import muteToggle from './methods/muteToggle';
import assignPresenter from './methods/assignPresenter';

Meteor.methods({
  kickUser,
  listenOnlyToggle,
  userLogout,
  muteUser: (...args) => muteToggle(...args, true),
  unmuteUser: (...args) => muteToggle(...args, false),
  assignPresenter,
});
