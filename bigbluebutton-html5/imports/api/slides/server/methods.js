import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import switchSlide from './methods/switchSlide';
import zoomSlide from './methods/zoomSlide';

Meteor.methods(mapToAcl(['methods.switchSlide', 'methods.zoomSlide'], {
  switchSlide,
  zoomSlide,
}));
