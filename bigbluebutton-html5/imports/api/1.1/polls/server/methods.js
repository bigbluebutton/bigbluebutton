import { Meteor } from 'meteor/meteor';
import publishVote from './methods/publishVote';
import mapToAcl from '/imports/startup/mapToAcl';

Meteor.methods(mapToAcl(['methods.publishVote'], {
  publishVote,
}));
