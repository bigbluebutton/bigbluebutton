import { Meteor } from 'meteor/meteor';
import removePresentation from './methods/removePresentation';
import sharePresentation from './methods/sharePresentation';

Meteor.methods({
  removePresentation,
  sharePresentation,
});
