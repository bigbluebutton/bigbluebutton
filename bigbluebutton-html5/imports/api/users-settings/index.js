import { Meteor } from 'meteor/meteor';

const UserSettings = new Mongo.Collection('users-settings');

if (Meteor.isServer) {
  UserSettings._ensureIndex({
    meetingId: 1, userId: 1,
  });
}

export default UserSettings;
