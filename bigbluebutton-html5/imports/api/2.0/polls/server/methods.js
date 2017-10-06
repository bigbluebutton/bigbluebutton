import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import publishVote from './methods/publishVote';

Meteor.methods(mapToAcl(['methods.publishVote'], {
  publishVote,
}));
