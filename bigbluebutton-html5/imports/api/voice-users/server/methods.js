import { Meteor } from 'meteor/meteor';
import listenOnlyToggle from './methods/listenOnlyToggle';
import muteToggle from './methods/muteToggle';
import ejectUserFromVoice from './methods/ejectUserFromVoice';

Meteor.methods({
  listenOnlyToggle,
  toggleSelfVoice: (credentials) => { muteToggle(credentials, credentials.requesterUserId); },
  toggleVoice: muteToggle,
  ejectUserFromVoice,
});
