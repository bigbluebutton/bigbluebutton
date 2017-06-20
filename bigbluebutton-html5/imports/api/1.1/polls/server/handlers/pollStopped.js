import { check } from 'meteor/check';
import removePoll from '../modifiers/removePoll';
import clearPolls from '../modifiers/clearPolls';

export default function pollStopped({ payload }) {
  check(payload, Object);

  const meetingId = payload.meeting_id;
  const poll = payload.poll;

  check(meetingId, String);

  if (poll) {
    const pollId = poll.id;

    check(pollId, String);

    return removePoll(meetingId, pollId);
  }

  return clearPolls(meetingId);
}
