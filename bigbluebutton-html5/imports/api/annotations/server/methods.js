import { Meteor } from 'meteor/meteor';
import sendAnnotations from './methods/sendAnnotations';
import sendBulkAnnotations from './methods/sendBulkAnnotations';

Meteor.methods({
  sendAnnotations,
  sendBulkAnnotations,
});
