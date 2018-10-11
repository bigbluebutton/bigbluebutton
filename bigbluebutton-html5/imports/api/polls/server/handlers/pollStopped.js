import { check } from 'meteor/check';
import removePoll from '../modifiers/removePoll';
import clearPolls from '../modifiers/clearPolls';

export default function pollStopped({ body }, meetingId) {
  const { poll } = body;

  check(meetingId, String);

  if (poll) {
    const { pollId } = poll;

    check(pollId, String);

    return removePoll(meetingId, pollId);
  }

  return clearPolls(meetingId);
}
