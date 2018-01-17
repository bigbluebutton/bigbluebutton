import { Meteor } from 'meteor/meteor';

const Cursor = new Mongo.Collection('cursor');

if (Meteor.isServer) {
  // types of queries for the cursor:
  // 1. meetingId (clear)
  // 2. meetingId, userId

  Cursor._ensureIndex({ meetingId: 1, userId: 1 });
}

export default Cursor;
