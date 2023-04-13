import { check } from 'meteor/check';
import removeGuest from '../modifiers/removeGuest';

export default async function handleGuestWaitingLeft({ body }, meetingId) {
  const { userId } = body;
  check(meetingId, String);
  check(userId, String);

  const result = await removeGuest(meetingId, userId);
  return result;
}
