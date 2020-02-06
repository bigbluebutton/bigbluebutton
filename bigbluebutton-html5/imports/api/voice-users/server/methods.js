import { Meteor } from 'meteor/meteor';
import listenOnlyToggle from './methods/listenOnlyToggle';
import muteToggle from './methods/muteToggle';
import muteAllToggle from './methods/muteAllToggle';
import muteAllExceptPresenterToggle from './methods/muteAllExceptPresenterToggle';
import ejectUserFromVoice from './methods/ejectUserFromVoice';
import { extractCredentials } from '/imports/api/common/server/helpers';

Meteor.methods({
  listenOnlyToggle,
  toggleSelfVoice: () => { muteToggle(extractCredentials(this.userId).requesterUserId); },
  toggleVoice: muteToggle,
  muteAllUsers: muteAllToggle,
  muteAllExceptPresenter: muteAllExceptPresenterToggle,
  ejectUserFromVoice,
});
