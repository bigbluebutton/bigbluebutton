import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import removePresentation from './methods/removePresentation';
import sharePresentation from './methods/sharePresentation';

Meteor.methods(mapToAcl(['methods.removePresentation', 'methods.sharePresentation'], {
  removePresentation,
  sharePresentation,
}));
