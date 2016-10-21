import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import addChat from '../modifiers/addChat';

export default function handleMeetingDestruction({ payload }) {
  const message = payload.message;
  const meetingId = payload.meeting_id;

  check(meetingId, String);
  check(message, Object);

  return addChat(meetingId, message);
};
