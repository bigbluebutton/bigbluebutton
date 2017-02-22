import { Meteor } from 'meteor/meteor';
import kickUser from './methods/kickUser';
import listenOnlyToggle from './methods/listenOnlyToggle';
import userLogout from './methods/userLogout';
import assignPresenter from './methods/assignPresenter';
import muteToggle from './methods/muteToggle';
import setEmojiStatus from './methods/setEmojiStatus';

Meteor.methods({
  kickUser,
  listenOnlyToggle,
  userLogout,
  assignPresenter,
  setEmojiStatus,
  muteUser: (...args) => muteToggle(...args, true),
  unmuteUser: (...args) => muteToggle(...args, false),
});
