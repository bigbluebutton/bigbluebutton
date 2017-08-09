import { check } from 'meteor/check';
import updateVotes from '../modifiers/updateVotes';

export default function userVoted({ body }, meetingId) {
  const { poll } = body;
  const { presenterId } = body;

  check(meetingId, String);
  check(poll, Object);
  check(presenterId, String);

  return updateVotes(poll, meetingId, presenterId);
}
