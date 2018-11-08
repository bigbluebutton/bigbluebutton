import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import endMeeting from './methods/endMeeting';
import toggleRecording from './methods/toggleRecording';
import transferUser from './methods/transferUser';
import toggleLockSettings from './methods/toggleLockSettings';
import toggleWebcamsOnlyForModerator from './methods/toggleWebcamsOnlyForModerator';

Meteor.methods(mapToAcl(['methods.endMeeting', 'methods.toggleRecording', 'methods.transferUser', 'methods.toggleLockSettings', 'methods.toggleWebcamsOnlyForModerator'], {
  endMeeting,
  toggleRecording,
  toggleLockSettings,
  transferUser,
  toggleWebcamsOnlyForModerator,
}));
