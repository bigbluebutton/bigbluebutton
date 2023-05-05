import { Meteor } from 'meteor/meteor';

const collectionOptions = Meteor.isClient ? {
  connection: null,
} : {};

const Users = new Mongo.Collection('users', collectionOptions);
export const CurrentUser = new Mongo.Collection('current-user', { connection: null });

if (Meteor.isServer) {
  // types of queries for the users:
  // 1. meetingId
  // 2. meetingId, userId
  // { connection: Meteor.isClient ? null : true }
  Users._ensureIndex({ meetingId: 1, userId: 1 });
}

export default Users;
