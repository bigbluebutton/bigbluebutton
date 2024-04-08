import { check } from 'meteor/check';
import setPublishedPoll from '../../../meetings/server/modifiers/setPublishedPoll';

export default function pollPublished({ body }, meetingId) {
  const { pollId } = body;

  check(meetingId, String);
  check(pollId, String);

  setPublishedPoll(meetingId, true);
}
