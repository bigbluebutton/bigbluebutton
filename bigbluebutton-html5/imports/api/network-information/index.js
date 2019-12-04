import { Meteor } from 'meteor/meteor';

const NetworkInformation = new Mongo.Collection('network-information');

if (Meteor.isServer) {
  NetworkInformation._ensureIndex({ meetingId: 1 });
}

export default NetworkInformation;
