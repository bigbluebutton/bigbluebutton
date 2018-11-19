import { Meteor } from 'meteor/meteor';
import endMeeting from './methods/endMeeting';
import toggleRecording from './methods/toggleRecording';
import transferUser from './methods/transferUser';

Meteor.methods({
  endMeeting,
  toggleRecording,
  transferUser,
});
