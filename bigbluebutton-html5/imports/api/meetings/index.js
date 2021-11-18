import { Meteor } from 'meteor/meteor';

const collectionOptions = Meteor.isClient ? {
  connection: null,
} : {};

const Meetings = new Mongo.Collection('meetings', collectionOptions);
const RecordMeetings = new Mongo.Collection('record-meetings', collectionOptions);
const ExternalVideoMeetings = new Mongo.Collection('external-video-meetings', collectionOptions);
const MeetingTimeRemaining = new Mongo.Collection('meeting-time-remaining', collectionOptions);

if (Meteor.isServer) {
  // types of queries for the meetings:
  // 1. meetingId

  Meetings._ensureIndex({ meetingId: 1 });
  RecordMeetings._ensureIndex({ meetingId: 1 });
  ExternalVideoMeetings._ensureIndex({ meetingId: 1 });
  MeetingTimeRemaining._ensureIndex({ meetingId: 1 });
}

export {
  RecordMeetings,
  ExternalVideoMeetings,
  MeetingTimeRemaining,
};
export default Meetings;
