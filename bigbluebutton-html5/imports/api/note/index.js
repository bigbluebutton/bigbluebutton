import { Meteor } from 'meteor/meteor';

const collectionOptions = Meteor.isClient ? {
  connection: null,
} : {};

const Note = new Mongo.Collection('note', collectionOptions);

if (Meteor.isServer) {
  Note._ensureIndex({ meetingId: 1, noteId: 1 });
}

export default Note;
