import { Meteor } from 'meteor/meteor';

const collectionOptions = Meteor.isClient ? {
  connection: null,
} : {};

const Screenshare = new Mongo.Collection('screenshare', collectionOptions);

if (Meteor.isServer) {
  // types of queries for the screenshare:
  // 1. meetingId

  Screenshare.createIndexAsync({ meetingId: 1 });
}

export default Screenshare;
