import { Meteor } from 'meteor/meteor';

const Questions = new Mongo.Collection('questions');

if (Meteor.isServer) {
  Questions._ensureIndex({ meetingId: 1, questionId: 1, userId: 1 });
}

export default Questions;
