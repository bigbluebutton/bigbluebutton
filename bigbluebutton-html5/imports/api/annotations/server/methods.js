import { Meteor } from 'meteor/meteor';
import undoAnnotation from './methods/undoAnnotation';
import removeAnnotation from './methods/removeAnnotation';
import moveAnnotation from './methods/moveAnnotation';
import reorderAnnotation from './methods/reorderAnnotation';
import clearWhiteboard from './methods/clearWhiteboard';
import sendAnnotation from './methods/sendAnnotation';
import sendBulkAnnotations from './methods/sendBulkAnnotations';

Meteor.methods({
  undoAnnotation,
  removeAnnotation,
  moveAnnotation,
  reorderAnnotation,
  clearWhiteboard,
  sendAnnotation,
  sendBulkAnnotations,
});
