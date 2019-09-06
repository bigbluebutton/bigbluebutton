import { Meteor } from 'meteor/meteor';

const VideoUsers = new Mongo.Collection('video-users');

if (Meteor.isServer) {
  // types of queries for the video users:
  // 2. meetingId

  VideoUsers._ensureIndex({ meetingId: 1 });
}

export default VideoUsers;
