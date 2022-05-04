// import { Meteor } from 'meteor/meteor';
// import switchSlide from './methods/switchSlide';
// import zoomSlide from './methods/zoomSlide';

// Meteor.methods({
//   switchSlide,
//   zoomSlide,
// });

import { Meteor } from 'meteor/meteor';
import switchSlide from './methods/switchSlide';
import zoomSlide from './methods/zoomSlide';
import persistAsset from './methods/persistAsset';

Meteor.methods({
  switchSlide,
  zoomSlide,
  persistAsset,
});