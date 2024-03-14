import { Meteor } from 'meteor/meteor';
import getServerTime from './methods/getServerTime';
import timerEnded from './methods/endTimer';

Meteor.methods({
  getServerTime,
  timerEnded,
});
