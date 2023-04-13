import { Meteor } from 'meteor/meteor';

const collectionOptions = Meteor.isClient ? {
  connection: null,
} : {};

const BreakoutsHistory = new Mongo.Collection('breakouts-history', collectionOptions);

if (Meteor.isServer) {
  BreakoutsHistory.createIndexAsync({ meetingId: 1 });
}

export default BreakoutsHistory;
