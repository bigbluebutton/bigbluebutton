import { Meteor } from 'meteor/meteor';

const collectionOptions = Meteor.isClient ? {
  connection: null,
} : {};

const VideoStreams = new Mongo.Collection('video-streams', collectionOptions);

if (Meteor.isServer) {
  // types of queries for the video users:
  // 2. meetingId

  VideoStreams._ensureIndex({ meetingId: 1 });
}

export default VideoStreams;
