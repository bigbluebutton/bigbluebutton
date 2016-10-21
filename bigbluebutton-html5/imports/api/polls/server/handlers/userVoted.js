import { check } from 'meteor/check';
import updatePoll from '../modifiers/updatePoll';

export default function userVoted({ payload }) {
  check(payload, Object);

  const meetingId = payload.meeting_id;
  const poll = payload.poll;
  const requesterId = payload.presenter_id;

  check(meetingId, String);
  check(poll, Object);
  check(requesterId, String);

  updatePoll(poll, meetingId, requesterId);
};
