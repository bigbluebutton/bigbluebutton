import { Meteor } from 'meteor/meteor';
import getNoteId from './methods/getNoteId';
import getPadContents from './methods/getPadContents';

Meteor.methods({
  getNoteId,
  getPadContents,
});
