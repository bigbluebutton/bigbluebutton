import { check } from 'meteor/check';
import addBreakout from '../modifiers/addBreakout';

export default function handleCreateBreakout({ body }) {
  const { breakoutMeetingId } = body.room.breakoutMeetingId;

  check(breakoutMeetingId, String);

  return addBreakout(body.room);
}
