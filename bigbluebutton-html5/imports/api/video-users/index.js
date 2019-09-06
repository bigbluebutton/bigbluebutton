import { Meteor } from 'meteor/meteor';

const VideoUsers = new Mongo.Collection('video-users');

if (Meteor.isServer) {
  // types of queries for the voice users:
  // 1. intId
  // 2. meetingId, intId

  VideoUsers._ensureIndex({ meetingId: 1 });
}

export default VideoUsers;
