import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import removeMeeting from '../modifiers/removeMeeting';

export default function handleMeetingDestruction({ payload }) {
  const meetingId = payload.meeting_id;

  check(meetingId, String);

  return removeMeeting(meetingId);
};
