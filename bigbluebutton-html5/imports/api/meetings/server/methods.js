import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import endMeeting from './methods/endMeeting';
import toggleRecording from './methods/toggleRecording';
import transferUser from './methods/transferUser';

Meteor.methods(mapToAcl(['methods.endMeeting', 'methods.toggleRecording', 'methods.transferUser'], {
  endMeeting,
  toggleRecording,
  transferUser,
}));
