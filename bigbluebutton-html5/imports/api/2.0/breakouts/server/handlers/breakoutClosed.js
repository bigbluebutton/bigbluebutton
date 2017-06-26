import clearBreakouts from '../modifiers/clearBreakouts';
import { check } from 'meteor/check';

export default function handleBreakoutClosed({ body }) {
  const { breakoutMeetingId } = body;

  check(breakoutMeetingId, String);

  return clearBreakouts(breakoutMeetingId);
}
