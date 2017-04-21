import { Meteor } from 'meteor/meteor';
import undoAnnotation from './methods/undoAnnotation';
import clearWhiteboard from './methods/clearWhiteboard';

Meteor.methods({
  undoAnnotation,
  clearWhiteboard,
});
