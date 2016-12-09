import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import addMeeting from '../modifiers/addMeeting';

export default function handleMeetingCreation({ payload }) {
  const meetingId = payload.meeting_id;

  check(meetingId, String);

  return addMeeting(payload);
};
