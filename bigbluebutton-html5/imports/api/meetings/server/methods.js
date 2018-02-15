import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import endMeeting from './methods/endMeeting';
import toggleRecording from './methods/toggleRecording';

Meteor.methods(mapToAcl(['methods.endMeeting', 'methods.toggleRecording'], {
  endMeeting,
  toggleRecording
}));
