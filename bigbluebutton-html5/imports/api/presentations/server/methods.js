import { Meteor } from 'meteor/meteor';
import removePresentation from './methods/removePresentation';
import setPresentation from './methods/setPresentation';
import setPresentationDownloadable from './methods/setPresentationDownloadable';

Meteor.methods({
  removePresentation,
  setPresentation,
  setPresentationDownloadable,
});
