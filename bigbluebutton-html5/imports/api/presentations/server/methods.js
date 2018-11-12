import { Meteor } from 'meteor/meteor';
import removePresentation from './methods/removePresentation';
import setPresentation from './methods/setPresentation';

Meteor.methods({
  removePresentation,
  setPresentation,
});
