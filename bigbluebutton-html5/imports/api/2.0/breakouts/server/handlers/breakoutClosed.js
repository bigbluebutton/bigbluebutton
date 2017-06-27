import { check } from 'meteor/check';
import clearBreakouts from '../modifiers/clearBreakouts';

export default function handleBreakoutClosed({ body }) {
  const { breakoutMeetingId } = body;

  check(breakoutMeetingId, String);

  return clearBreakouts(breakoutMeetingId);
}
