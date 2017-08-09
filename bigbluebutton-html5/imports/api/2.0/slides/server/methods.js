import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import switchSlide from './methods/switchSlide';

Meteor.methods(mapToAcl(['methods.switchSlide'], {
  switchSlide,
}));
