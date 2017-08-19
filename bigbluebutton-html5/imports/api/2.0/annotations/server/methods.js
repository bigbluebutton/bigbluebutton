import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import undoAnnotation from './methods/undoAnnotation';
import clearWhiteboard from './methods/clearWhiteboard';
import sendAnnotation from './methods/sendAnnotation';

Meteor.methods(mapToAcl(['methods.undoAnnotation', 'methods.clearWhiteboard', 'methods.sendAnnotation'], {
  undoAnnotation,
  clearWhiteboard,
  sendAnnotation,
}));
