import { Meteor } from 'meteor/meteor';

const collectionOptions = Meteor.isClient ? {
  connection: null,
} : {};

const PresentationPods = new Mongo.Collection('presentation-pods', collectionOptions);

if (Meteor.isServer) {
  // types of queries for the presentation pods:
  // 1. meetingId, podId  ( 4 )

  PresentationPods._ensureIndex({ meetingId: 1, podId: 1 });
}

export default PresentationPods;
