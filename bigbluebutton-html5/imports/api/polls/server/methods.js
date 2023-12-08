import { Meteor } from 'meteor/meteor';
import publishTypedVote from './methods/publishTypedVote';
import publishVote from './methods/publishVote';
import startPoll from './methods/startPoll';
import stopPoll from './methods/stopPoll';

Meteor.methods({
  publishVote,
  publishTypedVote,
  startPoll,
  stopPoll,
});
