import { check } from 'meteor/check';
import addPoll from '../modifiers/addPoll';
import setPublishedPoll from '../../../meetings/server/modifiers/setPublishedPoll';

export default function pollStarted({ body }, meetingId) {
  const { userId } = body;
  const { poll } = body;

  check(meetingId, String);
  check(userId, String);
  check(poll, Object);

  setPublishedPoll(meetingId, false);

  return addPoll(meetingId, userId, poll);
}
