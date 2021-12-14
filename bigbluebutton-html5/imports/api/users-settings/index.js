import { Meteor } from 'meteor/meteor';

const collectionOptions = Meteor.isClient ? {
  connection: null,
} : {};

const UserSettings = new Mongo.Collection('users-settings', collectionOptions);

if (Meteor.isServer) {
  UserSettings._ensureIndex({
    meetingId: 1, userId: 1,
  });
}

export default UserSettings;
