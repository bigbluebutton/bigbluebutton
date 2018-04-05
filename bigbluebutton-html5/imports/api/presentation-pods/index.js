import { Meteor } from 'meteor/meteor';

const PresentationPods = new Mongo.Collection('presentation-pods');

if (Meteor.isServer) {
  // types of queries for the presentation pods:
  // 1. meetingId, podId
  // 2. meetingId
  PresentationPods._ensureIndex({ meetingId: 1, podId: 1 });
}

export default PresentationPods;
