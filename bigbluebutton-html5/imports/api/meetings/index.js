import { Meteor } from 'meteor/meteor';

const Meetings = new Mongo.Collection('meetings');
const RecordMeetings = new Mongo.Collection('record-meetings');
const MeetingTimeRemaing = new Mongo.Collection('meeting-time-remaing');

if (Meteor.isServer) {
  // types of queries for the meetings:
  // 1. meetingId

  Meetings._ensureIndex({ meetingId: 1 });
  RecordMeetings._ensureIndex({ meetingId: 1 });
  MeetingTimeRemaing._ensureIndex({ meetingId: 1 });
}

export {
  RecordMeetings,
  MeetingTimeRemaing,
};
export default Meetings;
