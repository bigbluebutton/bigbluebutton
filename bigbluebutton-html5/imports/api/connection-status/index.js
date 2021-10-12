import { Meteor } from 'meteor/meteor';

const ConnectionStatus = new Mongo.Collection('connection-status');

if (Meteor.isServer) {
  ConnectionStatus._ensureIndex({ meetingId: 1, userId: 1 });
}

export default ConnectionStatus;
