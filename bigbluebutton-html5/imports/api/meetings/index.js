import { Meteor } from 'meteor/meteor';

const Meetings = new Mongo.Collection('meetings');
const RecordMeetings = new Mongo.Collection('record-meetings');
const MeetingTimeRemaining = new Mongo.Collection('meeting-time-remaining');

if (Meteor.isServer) {
  // types of queries for the meetings:
  // 1. meetingId

  Meetings._ensureIndex({ meetingId: 1 });
  RecordMeetings._ensureIndex({ meetingId: 1 });
  MeetingTimeRemaining._ensureIndex({ meetingId: 1 });
}

export {
  RecordMeetings,
  MeetingTimeRemaining,
};
export default Meetings;
