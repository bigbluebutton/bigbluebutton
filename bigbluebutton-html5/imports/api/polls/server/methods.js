import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import publishVote from './methods/publishVote';
import startPoll from './methods/startPoll';

Meteor.methods(mapToAcl(['methods.publishVote', 'methods.startPoll'], {
  publishVote,
  startPoll,
}));
