import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import listenOnlyToggle from './methods/listenOnlyToggle';
import muteToggle from './methods/muteToggle';
import ejectUserFromVoice from './methods/ejectUserFromVoice';

Meteor.methods(mapToAcl(['methods.listenOnlyToggle', 'methods.toggleSelfVoice',
  'methods.toggleVoice', 'methods.ejectUserFromVoice'], {
  listenOnlyToggle,
  toggleSelfVoice: (credentials) => { muteToggle(credentials, credentials.requesterUserId); },
  toggleVoice: muteToggle,
  ejectUserFromVoice,
}));
