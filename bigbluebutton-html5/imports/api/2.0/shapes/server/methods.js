import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import undoAnnotation from './methods/undoAnnotation';
import clearWhiteboard from './methods/clearWhiteboard';

Meteor.methods(mapToAcl(['methods.undoAnnotation', 'methods.clearWhiteboard'], {
  undoAnnotation,
  clearWhiteboard,
}));
