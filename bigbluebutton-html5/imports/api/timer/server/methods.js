import { Meteor } from 'meteor/meteor';
import switchTimer from './methods/switchTimer';
import setTimer from './methods/setTimer';
import getServerTime from './methods/getServerTime';
import setTrack from './methods/setTrack';
import timerEnded from './methods/endTimer';

Meteor.methods({
  switchTimer,
  setTimer,
  getServerTime,
  setTrack,
  timerEnded,
});
