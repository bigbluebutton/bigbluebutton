import { Meteor } from 'meteor/meteor';
import switchSlide from './methods/switchSlide';

Meteor.methods({
  switchSlide,
  switchSlideMessage: switchSlide, // legacy
});
