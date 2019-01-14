import { Meteor } from 'meteor/meteor';

const Timers = new Mongo.Collection('timers');

if (Meteor.isServer) {
  // types of queries for the slides:
  // 1. meetingId
  // 2. meetingId, isRunning

    Timers._ensureIndex({ meetingId: 1, minute: 0, second: 0, isRunning: false });
}

export default Timers;
