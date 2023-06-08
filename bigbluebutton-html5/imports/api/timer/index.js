import { Meteor } from 'meteor/meteor';

const Timer = new Mongo.Collection('timer');

if (Meteor.isServer) {
  Timer.createIndex({ meetingId: 1 });
}

export default Timer;
