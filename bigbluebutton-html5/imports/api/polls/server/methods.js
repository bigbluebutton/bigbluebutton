import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import publishVote from './methods/publishVote';
import initiatePoll from './methods/initiatePoll';

Meteor.methods(mapToAcl(['methods.publishVote', 'methods.initiatePoll'], {
  publishVote,
  initiatePoll,
}));
