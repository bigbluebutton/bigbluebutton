import { Meteor } from 'meteor/meteor';
import endMeeting from './methods/endMeeting';
import toggleRecording from './methods/toggleRecording';
import transferUser from './methods/transferUser';
import toggleLockSettings from './methods/toggleLockSettings';
import toggleWebcamsOnlyForModerator from './methods/toggleWebcamsOnlyForModerator';

Meteor.methods({
  endMeeting,
  toggleRecording,
  toggleLockSettings,
  transferUser,
  toggleWebcamsOnlyForModerator,
});
