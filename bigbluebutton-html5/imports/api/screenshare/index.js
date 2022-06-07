import { Meteor } from 'meteor/meteor';

const Screenshare = new Mongo.Collection('screenshare');

if (Meteor.isServer) {
  // types of queries for the screenshare:
  // 1. meetingId

  Screenshare._ensureIndex({ meetingId: 1 });
}

export default Screenshare;
