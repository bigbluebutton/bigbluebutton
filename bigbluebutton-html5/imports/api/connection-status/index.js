import { Meteor } from 'meteor/meteor';

const collectionOptions = Meteor.isClient ? {
  connection: null,
} : {};

const ConnectionStatus = new Mongo.Collection('connection-status', collectionOptions);

if (Meteor.isServer) {
  ConnectionStatus._ensureIndex({ meetingId: 1, userId: 1 });
}

export default ConnectionStatus;
