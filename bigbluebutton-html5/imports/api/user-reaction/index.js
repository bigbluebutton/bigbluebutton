import { Meteor } from 'meteor/meteor';

const expireSeconds = Meteor.settings.public.userReaction.expire;
const UserReaction = new Mongo.Collection('user-reaction');

if (Meteor.isServer) {
  // TTL indexes are special single-field indexes to automatically remove documents
  // from a collection after a certain amount of time.
  // A single-field with only a date is necessary to this special single-field index, because
  // compound indexes do not support TTL.
  UserReaction._ensureIndex({ creationDate: 1 }, { expireAfterSeconds: expireSeconds });
}

export default UserReaction;
