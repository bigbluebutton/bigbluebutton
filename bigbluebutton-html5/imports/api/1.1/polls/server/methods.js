import { Meteor } from 'meteor/meteor';
import publishVote1x   from './methods/publishVote';
import mapToAcl from '/imports/startup/mapToAcl';

Meteor.methods(mapToAcl(['methods.publishVote'], {
  publishVote1x,
}));
