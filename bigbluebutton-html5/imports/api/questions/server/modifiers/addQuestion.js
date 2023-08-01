import { check } from 'meteor/check';
import Questions from '/imports/api/questions';
import Logger from '/imports/startup/server/logger';

export default function addQuestion(
  meetingId,
  userId,
  questionId,
  userName,
  text,
  timestamp,
  approved
) {
  check(meetingId, String);
  check(userId, String);
  check(questionId, String);
  check(userName, String);
  check(text, String);
  check(timestamp, Number);
  check(approved, Boolean);

  const selector = {
    meetingId,
    questionId,
  };

  const modifier = {
    meetingId,
    userId,
    questionId,
    userName,
    text,
    timestamp,
    approved,
    approvedTimestamp: approved ? Date.now() : 0,
    answered: false,
    upvoters: [],
    numUpvotes: 0,
  };

  try {
    const { numberAffected } = Questions.upsert(selector, modifier);

    if (numberAffected) {
      Logger.verbose(`Added question meetingId=${meetingId} questionId=${questionId}`);
    }
  } catch (err) {
    Logger.error(`Adding question: ${err}`);
  }
}
