import { Meteor } from 'meteor/meteor';

const collectionOptions = Meteor.isClient ? {
  connection: null,
} : {};

const WhiteboardMultiUser = new Mongo.Collection('whiteboard-multi-user', collectionOptions);

if (Meteor.isServer) {
  // types of queries for the whiteboard-multi-user:
  // 1. meetingId

  WhiteboardMultiUser._ensureIndex({ meetingId: 1 });
}

export default WhiteboardMultiUser;
