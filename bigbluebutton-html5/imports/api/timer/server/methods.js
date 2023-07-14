import { Meteor } from 'meteor/meteor';
import activateTimer from './methods/activateTimer';
import deactivateTimer from './methods/deactivateTimer';
import resetTimer from './methods/resetTimer';
import startTimer from './methods/startTimer';
import stopTimer from './methods/stopTimer';
import switchTimer from './methods/switchTimer';
import setTimer from './methods/setTimer';
import getServerTime from './methods/getServerTime';
import setTrack from './methods/setTrack';
import timerEnded from './methods/endTimer';

Meteor.methods({
  activateTimer,
  deactivateTimer,
  resetTimer,
  startTimer,
  stopTimer,
  switchTimer,
  setTimer,
  getServerTime,
  setTrack,
  timerEnded,
});
