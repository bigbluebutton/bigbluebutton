import { Meteor } from 'meteor/meteor';

const collectionOptions = Meteor.isClient ? {
  connection: null,
} : {};

const Breakouts = new Mongo.Collection('breakouts', collectionOptions);

if (Meteor.isServer) {
  // types of queries for the breakouts:
  // 1. breakoutId ( handleJoinUrl, roomStarted, clearBreakouts )
  // 2. parentMeetingId ( updateTimeRemaining )

  Breakouts._ensureIndex({ breakoutId: 1 });
  Breakouts._ensureIndex({ parentMeetingId: 1 });
}

export default Breakouts;
