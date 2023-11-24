import { Meteor } from 'meteor/meteor';

const collectionOptions = Meteor.isClient ? {
  connection: null,
} : {};

const UsersTyping = new Mongo.Collection('users-typing', collectionOptions);

if (Meteor.isServer) {
  UsersTyping.createIndexAsync({ meetingId: 1, isTypingTo: 1 });
}

export { UsersTyping };
