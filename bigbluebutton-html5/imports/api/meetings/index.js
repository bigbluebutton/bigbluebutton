import { Meteor } from 'meteor/meteor';

const collectionOptions = Meteor.isClient ? {
  connection: null,
} : {};

const Meetings = new Mongo.Collection('meetings', collectionOptions);
const RecordMeetings = new Mongo.Collection('record-meetings', collectionOptions);
const ExternalVideoMeetings = new Mongo.Collection('external-video-meetings', collectionOptions);
const MeetingTimeRemaining = new Mongo.Collection('meeting-time-remaining', collectionOptions);
const Notifications = new Mongo.Collection('notifications', collectionOptions);
const LayoutMeetings = new Mongo.Collection('layout-meetings');

if (Meteor.isServer) {
  // types of queries for the meetings:
  // 1. meetingId

  Meetings.createIndexAsync({ meetingId: 1 });
  RecordMeetings.createIndexAsync({ meetingId: 1 });
  ExternalVideoMeetings.createIndexAsync({ meetingId: 1 });
  MeetingTimeRemaining.createIndexAsync({ meetingId: 1 });
  LayoutMeetings.createIndexAsync({ meetingId: 1 });
}

export {
  RecordMeetings,
  ExternalVideoMeetings,
  MeetingTimeRemaining,
  Notifications,
  LayoutMeetings,
};
export default Meetings;
