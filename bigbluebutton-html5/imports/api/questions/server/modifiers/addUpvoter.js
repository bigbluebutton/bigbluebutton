import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Questions from '/imports/api/questions';

export default function addUpvoter(meetingId, questionId, upvoterId, numUpvotes) {
  check(meetingId, String);
  check(questionId, String);
  check(upvoterId, String);
  check(numUpvotes, Number);

  const selector = {
    meetingId,
    questionId,
  };

  const modifier = { $push: { upvoters: upvoterId }, $set: { numUpvotes } };

  try {
    const { numberAffected } = Questions.upsert(selector, modifier);

    if (numberAffected) {
      Logger.verbose(`Added upvote meetingId=${meetingId} questionId=${questionId}`);
    }
  } catch (err) {
    Logger.error(`Adding upvote: ${err}`);
  }
}
