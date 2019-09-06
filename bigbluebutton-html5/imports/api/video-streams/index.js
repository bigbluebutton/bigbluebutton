import { Meteor } from 'meteor/meteor';

const VideoStreams = new Mongo.Collection('video-streams');

if (Meteor.isServer) {
  // types of queries for the video users:
  // 2. meetingId

  VideoStreams._ensureIndex({ meetingId: 1 });
}

export default VideoStreams;
