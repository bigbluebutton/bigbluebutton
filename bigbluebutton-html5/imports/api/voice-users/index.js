import { Meteor } from 'meteor/meteor';

const collectionOptions = Meteor.isClient ? {
  connection: null,
} : {};

const VoiceUsers = new Mongo.Collection('voiceUsers', collectionOptions);

if (Meteor.isServer) {
  // types of queries for the voice users:
  // 1. intId
  // 2. meetingId, intId

  VoiceUsers._ensureIndex({ intId: 1 });
  VoiceUsers._ensureIndex({ meetingId: 1, intId: 1 });
}

export default VoiceUsers;
