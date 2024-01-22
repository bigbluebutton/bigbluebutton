import { Meteor } from 'meteor/meteor';
import endMeeting from './methods/endMeeting';
import toggleRecording from './methods/toggleRecording';
import toggleLockSettings from './methods/toggleLockSettings';
import toggleWebcamsOnlyForModerator from './methods/toggleWebcamsOnlyForModerator';
import clearRandomlySelectedUser from './methods/clearRandomlySelectedUser';
import changeLayout from './methods/changeLayout';
import setPushLayout from './methods/setPushLayout';

Meteor.methods({
  endMeeting,
  toggleRecording,
  toggleLockSettings,
  toggleWebcamsOnlyForModerator,
  clearRandomlySelectedUser,
  changeLayout,
  setPushLayout,
});
