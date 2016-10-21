import { check } from 'meteor/check';
import clearPolls from '../modifiers/clearPolls';

export default function pollStopped({ payload }) {
  check(payload, Object);

  const meetingId = payload.meeting_id;
  const pollId = payload.poll_id;

  check(meetingId, String);
  check(pollId, String);

  clearPolls(meetingId, pollId);
}
