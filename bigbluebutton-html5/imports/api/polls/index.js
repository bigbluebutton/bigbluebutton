import { Meteor } from 'meteor/meteor';

const Polls = new Mongo.Collection('polls');

if (Meteor.isServer) {
  // We can have just one active poll per meeting
  // makes no sense to index it by anything other than meetingId

  Polls._ensureIndex({ meetingId: 1 });
}

export default Polls;
