import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import endMeeting from './methods/endMeeting';

Meteor.methods(mapToAcl(['methods.endMeeting'], {
  endMeeting,
}));
