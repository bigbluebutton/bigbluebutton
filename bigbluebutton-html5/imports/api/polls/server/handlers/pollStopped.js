import { check } from 'meteor/check';
import removePoll from '../modifiers/removePoll';
import clearPolls from '../modifiers/clearPolls';

export default async function pollStopped({ body }, meetingId) {
  const { poll } = body;

  check(meetingId, String);

  if (poll) {
    const { pollId } = poll;

    check(pollId, String);

    const result = await removePoll(meetingId, pollId);

    return result;
  }

  const result = await clearPolls(meetingId);

  return result;
}
