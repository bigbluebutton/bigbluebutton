import { Meteor } from 'meteor/meteor';
import setTimer from './methods/setTimer';
import getServerTime from './methods/getServerTime';
import timerEnded from './methods/endTimer';

Meteor.methods({
  setTimer,
  getServerTime,
  timerEnded,
});
