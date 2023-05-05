import { check } from 'meteor/check';
import changePin from '../modifiers/changePin';

export default function userPinChanged({ body }, meetingId) {
  const { userId, pin, changedBy } = body;

  check(meetingId, String);
  check(userId, String);
  check(pin, Boolean);
  check(changedBy, String);

  return changePin(meetingId, userId, pin, changedBy);
}
