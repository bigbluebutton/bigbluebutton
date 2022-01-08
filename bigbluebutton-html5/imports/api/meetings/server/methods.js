import { Meteor } from 'meteor/meteor';
import endMeeting from './methods/endMeeting';
import toggleRecording from './methods/toggleRecording';
import transferUser from './methods/transferUser';
import toggleLockSettings from './methods/toggleLockSettings';
import toggleWebcamsOnlyForModerator from './methods/toggleWebcamsOnlyForModerator';
import clearRandomlySelectedUser from './methods/clearRandomlySelectedUser';
import changeLayout from './methods/changeLayout';
import setWhiteboardMode from './methods/setWhiteboardMode';
import setVisited from './methods/setVisited';

Meteor.methods({
  endMeeting,
  toggleRecording,
  toggleLockSettings,
  transferUser,
  toggleWebcamsOnlyForModerator,
  clearRandomlySelectedUser,
  changeLayout,
  setWhiteboardMode,
  setVisited,
});
