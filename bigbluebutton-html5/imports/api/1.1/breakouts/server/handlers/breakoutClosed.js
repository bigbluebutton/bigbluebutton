import { check } from 'meteor/check';
import clearBreakouts from '../modifiers/clearBreakouts';

export default function handleBreakoutClosed({ payload }) {
  const meetingId = payload.meetingId;

  check(meetingId, String);

  return clearBreakouts(meetingId);
}
