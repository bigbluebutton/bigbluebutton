import { Meteor } from 'meteor/meteor';

const AudioCaptions = new Mongo.Collection('audio-captions');

if (Meteor.isServer) {
  AudioCaptions._ensureIndex({ meetingId: 1 });
}

export default AudioCaptions;
