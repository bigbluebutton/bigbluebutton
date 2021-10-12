import { check } from 'meteor/check';
import removeGuest from '../modifiers/removeGuest';

export default function handleGuestWaitingLeft({ body }, meetingId) {
  const { userId } = body;
  check(meetingId, String);
  check(userId, String);

  return removeGuest(meetingId, userId);
}
