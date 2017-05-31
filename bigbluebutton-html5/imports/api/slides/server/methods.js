import { Meteor } from 'meteor/meteor';
import switchSlide from './methods/switchSlide';
import mapToAcl from '/imports/startup/mapToAcl';

Meteor.methods(mapToAcl({
  switchSlide,
  switchSlideMessage: switchSlide, // legacy
}));
