import { Meteor } from 'meteor/meteor';

const UserInfos = new Mongo.Collection('users-infos');

if (Meteor.isServer) {
  UserInfos._ensureIndex({ meetingId: 1, userId: 1 });
}

export default UserInfos;
