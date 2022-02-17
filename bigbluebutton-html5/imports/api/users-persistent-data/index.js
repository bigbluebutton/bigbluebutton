import { Meteor } from 'meteor/meteor';

const collectionOptions = Meteor.isClient ? {
  connection: null,
} : {};

const UsersPersistentData = new Mongo.Collection('users-persistent-data', collectionOptions);

if (Meteor.isServer) {
  UsersPersistentData._ensureIndex({ meetingId: 1, userId: 1 });
}

export default UsersPersistentData;
