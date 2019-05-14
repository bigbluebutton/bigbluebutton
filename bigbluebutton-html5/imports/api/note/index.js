import { Meteor } from 'meteor/meteor';

const Note = new Mongo.Collection('note');

if (Meteor.isServer) {
  Note._ensureIndex({ meetingId: 1 });
}

export default Note;
