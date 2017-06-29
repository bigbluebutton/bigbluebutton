import { check } from 'meteor/check';
import removePoll from '../modifiers/removePoll';

export default function pollPublished(meetingId, { body }) {
  const { pollId } = body;

  check(meetingId, String);

  return removePoll(meetingId, pollId);
}
