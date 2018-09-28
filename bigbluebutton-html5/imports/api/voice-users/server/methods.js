import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import listenOnlyToggle from './methods/listenOnlyToggle';
import muteToggle from './methods/muteToggle';
import muteAllToggle from './methods/muteAllToggle';
import muteAllExceptPresenterToggle from './methods/muteAllExceptPresenterToggle';
import ejectUserFromVoice from './methods/ejectUserFromVoice';

Meteor.methods(mapToAcl(['methods.listenOnlyToggle', 'methods.toggleSelfVoice',
  'methods.toggleVoice', 'methods.ejectUserFromVoice', 'methods.muteAllUsers', 'methods.muteAllExceptPresenter'], {
  listenOnlyToggle,
  toggleSelfVoice: (credentials) => { muteToggle(credentials, credentials.requesterUserId); },
  toggleVoice: muteToggle,
  muteAllUsers: muteAllToggle,
  muteAllExceptPresenter: muteAllExceptPresenterToggle,
  ejectUserFromVoice,
}));
