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
import addShape from './methods/addShape';
import removeShape from './methods/removeShape';
import persistAsset from './methods/persistAsset';

Meteor.methods({
  switchSlide,
  zoomSlide,
  persistShape: addShape,
  persistAsset,
  removeShape,
});