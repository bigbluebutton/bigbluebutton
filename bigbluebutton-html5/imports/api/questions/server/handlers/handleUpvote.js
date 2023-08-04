import { check } from 'meteor/check';
import addUpvoter from '/imports/api/questions/server/modifiers/addUpvoter';
import removeUpvoter from '/imports/api/questions/server/modifiers/removeUpvoter';

export default function handleUpvote({ body }, meetingId) {
  const { questionId, upvoterId, upvoteHeld, numUpvotes } = body;

  check(meetingId, String);
  check(questionId, String);
  check(upvoterId, String);
  check(upvoteHeld, Boolean);
  check(numUpvotes, Number);

  if (upvoteHeld) {
    addUpvoter(meetingId, questionId, upvoterId, numUpvotes);
  } else {
    removeUpvoter(meetingId, questionId, upvoterId, numUpvotes);
  }
}