import { Meteor } from 'meteor/meteor';
import switchSlide from './methods/switchSlide';
import zoomSlide from './methods/zoomSlide';
import fitToWidth from './methods/fitToWidth';

Meteor.methods({
  switchSlide,
  zoomSlide,
  fitToWidth,
});
