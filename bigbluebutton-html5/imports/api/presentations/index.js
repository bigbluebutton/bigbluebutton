import { Meteor } from 'meteor/meteor';

const Presentations = new Mongo.Collection('presentations');

if (Meteor.isServer) {
  // types of queries for the presentations:
  // 1. meetingId, id
  // 2. meetingId

  Presentations._ensureIndex({ meetingId: 1, id: 1 });
}

export default Presentations;
