import { Meteor } from 'meteor/meteor';
import startPoll from './methods/startPoll';
import stopPoll from './methods/stopPoll';

Meteor.methods({
  startPoll,
  stopPoll,
});
