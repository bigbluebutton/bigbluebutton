import { Meteor } from 'meteor/meteor';

const Meetings = new Mongo.Collection('meetings2x');

if (Meteor.isServer) {
  // types of queries for the meetings:
  // 1. meetingId

  Meetings._ensureIndex({ meetingId: 1 });
}

export default Meetings;
