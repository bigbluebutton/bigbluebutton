import { check } from 'meteor/check';
import changePin from '../modifiers/changePin';

export default async function handlePinAssigned({ body }, meetingId) {
  const { userId, pin, changedBy } = body;

  check(meetingId, String);
  check(userId, String);
  check(pin, Boolean);
  check(changedBy, String);

  const result = await changePin(meetingId, userId, pin, changedBy);
  return result;
}
