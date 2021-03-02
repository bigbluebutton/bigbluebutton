import { check } from 'meteor/check';
import addPoll from '../modifiers/addPoll';
import setPublishedPoll from '../../../meetings/server/modifiers/setPublishedPoll';

export default function pollStarted({ body }, meetingId) {
  const {
    userId, poll, pollType, question,
  } = body;

  check(meetingId, String);
  check(userId, String);
  check(poll, Object);
  check(pollType, String);
  check(question, String);

  setPublishedPoll(meetingId, false);

  return addPoll(meetingId, userId, poll, pollType, question);
}
