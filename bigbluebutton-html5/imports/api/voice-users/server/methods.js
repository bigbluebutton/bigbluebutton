import { Meteor } from 'meteor/meteor';
import listenOnlyToggle from './methods/listenOnlyToggle';
import muteToggle from './methods/muteToggle';
import muteAllToggle from './methods/muteAllToggle';
import muteAllExceptPresenterToggle from './methods/muteAllExceptPresenterToggle';
import ejectUserFromVoice from './methods/ejectUserFromVoice';

Meteor.methods({
  listenOnlyToggle,
  toggleVoice: muteToggle,
  muteAllUsers: muteAllToggle,
  muteAllExceptPresenter: muteAllExceptPresenterToggle,
  ejectUserFromVoice,
});
