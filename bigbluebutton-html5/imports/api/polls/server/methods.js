import { Meteor } from 'meteor/meteor';
import publishVote from './methods/publishVote';
import startPoll from './methods/startPoll';
import stopPoll from './methods/stopPoll';

Meteor.methods({
  publishVote,
  startPoll,
  stopPoll,
});
