import { check } from 'meteor/check';
import clearPolls from '../modifiers/clearPolls';

export default function pollStopped({ payload }) {
  check(payload, Object);

  console.log(payload);
  const meetingId = payload.meeting_id;
  const pollId = payload.poll.id;

  check(meetingId, String);
  check(pollId, String);

  clearPolls(meetingId, pollId);
}
