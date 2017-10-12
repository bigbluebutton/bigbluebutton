import { check } from 'meteor/check';
import addPoll from '../modifiers/addPoll';

export default function pollStarted({ body }, meetingId) {
  const { userId } = body;
  const { poll } = body;

  check(meetingId, String);
  check(userId, String);
  check(poll, Object);

  return addPoll(meetingId, userId, poll);
}
