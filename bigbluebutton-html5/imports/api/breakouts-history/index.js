import { Meteor } from 'meteor/meteor';

const BreakoutsHistory = new Mongo.Collection('breakouts-history');

if (Meteor.isServer) {
  BreakoutsHistory._ensureIndex({ meetingId: 1 });
}

export default BreakoutsHistory;
