import { check } from 'meteor/check';
import updateVotes from '../modifiers/updateVotes';

export default function userVoted({ payload }) {
  check(payload, Object);

  const meetingId = payload.meeting_id;
  const poll = payload.poll;
  const requesterId = payload.presenter_id;

  check(meetingId, String);
  check(poll, Object);
  check(requesterId, String);

  return updateVotes(poll, meetingId, requesterId);
};
