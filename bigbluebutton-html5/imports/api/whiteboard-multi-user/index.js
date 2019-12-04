import { Meteor } from 'meteor/meteor';

const WhiteboardMultiUser = new Mongo.Collection('whiteboard-multi-user');

if (Meteor.isServer) {
  // types of queries for the whiteboard-multi-user:
  // 1. meetingId

  WhiteboardMultiUser._ensureIndex({ meetingId: 1 });
}

export default WhiteboardMultiUser;
