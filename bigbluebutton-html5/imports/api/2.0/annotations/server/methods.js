import { Meteor } from 'meteor/meteor';
import undoAnnotation from './methods/undoAnnotation';
import clearWhiteboard from './methods/clearWhiteboard';
import sendAnnotation from './methods/sendAnnotation';

Meteor.methods({
  undoAnnotation,
  clearWhiteboard,
  sendAnnotation,
});
