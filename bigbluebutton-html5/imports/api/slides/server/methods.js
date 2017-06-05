import { Meteor } from 'meteor/meteor';
import switchSlide from './methods/switchSlide';
import mapToAcl from '/imports/startup/mapToAcl';

Meteor.methods(mapToAcl(['methods.switchSlide', 'methods.switchSlideMessage'], {
  switchSlide,
  switchSlideMessage: switchSlide, // legacy
}));
