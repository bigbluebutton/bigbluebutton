import { Meteor } from 'meteor/meteor';

const AudioCaptions = new Mongo.Collection('audio-captions');

if (Meteor.isServer) {
  AudioCaptions.createIndexAsync({ meetingId: 1 });
}

export default AudioCaptions;
