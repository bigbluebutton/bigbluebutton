import { Meteor } from 'meteor/meteor';

const collectionOptions = Meteor.isClient ? {
  connection: null,
} : {};

const UserInfos = new Mongo.Collection('users-infos', collectionOptions);

if (Meteor.isServer) {
  UserInfos.createIndexAsync({ meetingId: 1, userId: 1 });
}

export default UserInfos;
