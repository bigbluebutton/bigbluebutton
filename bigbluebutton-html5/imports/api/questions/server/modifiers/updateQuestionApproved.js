import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Questions from '/imports/api/questions';

export default function updateQuestionApproved(meetingId, questionId, approved) {
  check(meetingId, String);
  check(questionId, String);
  check(approved, Boolean);

  const selector = {
    meetingId,
    questionId,
  };

  const modifier = {
    $set: {
      approved,
      approvedTimestamp: Date.now(),
    },
  };

  try {
    const { numberAffected } = Questions.upsert(selector, modifier);

    if (numberAffected) {
      Logger.verbose(`Approved question meetingId=${meetingId} questionId=${questionId}`);
    }
  } catch (err) {
    Logger.error(`Approving question: ${err}`);
  }
}
