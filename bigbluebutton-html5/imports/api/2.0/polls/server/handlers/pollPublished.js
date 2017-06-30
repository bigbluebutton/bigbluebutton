import { check } from 'meteor/check';
import removePoll from '../modifiers/removePoll';

export default function pollPublished({ body }, meetingId) {
  const { pollId } = body;

  check(meetingId, String);

  return removePoll(meetingId, pollId);
}
