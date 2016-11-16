import { check } from 'meteor/check';
import addPoll from '../modifiers/addPoll';

export default function pollStarted({ payload }) {
  check(payload, Object);

  const meetingId = payload.meeting_id;
  const requesterId = payload.requester_id;
  const poll = payload.poll;

  check(meetingId, String);
  check(requesterId, String);
  check(poll, Object);

  return addPoll(meetingId, requesterId, poll);
}
