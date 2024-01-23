import { Meteor } from 'meteor/meteor';
import sendAnnotations from './methods/sendAnnotations';
import sendBulkAnnotations from './methods/sendBulkAnnotations';
import deleteAnnotations from './methods/deleteAnnotations';

Meteor.methods({
  sendAnnotations,
  sendBulkAnnotations,
  deleteAnnotations,
});
