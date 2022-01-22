import { Meteor } from 'meteor/meteor';
import switchSlide from './methods/switchSlide';
import zoomSlide from './methods/zoomSlide';
import addFitToWidth from './methods/addFitToWidth';

Meteor.methods({
  switchSlide,
  zoomSlide,
  addFitToWidth,
});
