import { Meteor } from 'meteor/meteor';
import activateTimer from './methods/activateTimer';
import deactivateTimer from './methods/deactivateTimer';
import resetTimer from './methods/resetTimer';
import startTimer from './methods/startTimer';
import stopTimer from './methods/stopTimer';
import getCurrentTime from './methods/getCurrentTime';

Meteor.methods({
  activateTimer,
  deactivateTimer,
  resetTimer,
  startTimer,
  stopTimer,
  getCurrentTime,
});
