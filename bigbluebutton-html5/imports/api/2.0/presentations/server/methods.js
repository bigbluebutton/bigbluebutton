import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import removePresentation from './methods/removePresentation';
import setPresentation from './methods/setPresentation';

Meteor.methods(mapToAcl(['methods.removePresentation', 'methods.setPresentation'], {
  removePresentation,
  setPresentation,
}));
