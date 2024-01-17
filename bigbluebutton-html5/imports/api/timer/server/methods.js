import { Meteor } from 'meteor/meteor';
import setTimer from './methods/setTimer';
import getServerTime from './methods/getServerTime';
import setTrack from './methods/setTrack';
import timerEnded from './methods/endTimer';

Meteor.methods({
  setTimer,
  getServerTime,
  setTrack,
  timerEnded,
});
