import { Meteor } from 'meteor/meteor';

const Timer = new Mongo.Collection('timer');

if (Meteor.isServer) {
  Timer._ensureIndex({ meetingId: 1 });
}

export default Timer;
