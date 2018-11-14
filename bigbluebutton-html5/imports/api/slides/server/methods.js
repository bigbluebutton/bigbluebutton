import { Meteor } from 'meteor/meteor';
import switchSlide from './methods/switchSlide';
import zoomSlide from './methods/zoomSlide';

Meteor.methods({
  switchSlide,
  zoomSlide,
});
