import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import changeWhiteboardAccess from './methods/changeWhiteboardAccess';

Meteor.methods(mapToAcl(['methods.modifyWhiteboardAccess'], {
  changeWhiteboardAccess,
}));
