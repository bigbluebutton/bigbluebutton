import { Meteor } from 'meteor/meteor';

const collectionOptions = Meteor.isClient ? {
  connection: null,
} : {};

const UserInfos = new Mongo.Collection('users-infos', collectionOptions);

if (Meteor.isServer) {
  UserInfos._ensureIndex({ meetingId: 1, userId: 1 });
}

export default UserInfos;
