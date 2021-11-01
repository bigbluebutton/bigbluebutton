import { Meteor } from 'meteor/meteor';

const UsersPersistentData = new Mongo.Collection('users-persistent-data');

if (Meteor.isServer) {
  UsersPersistentData._ensureIndex({ meetingId: 1, userId: 1 });
}

export default UsersPersistentData;
