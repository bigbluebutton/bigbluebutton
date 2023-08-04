import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Questions from '/imports/api/questions';

export default function updateQuestionAnswered(meetingId, questionId, answerText) {
  check(meetingId, String);
  check(questionId, String);
  check(answerText, String);

  const selector = {
    meetingId,
    questionId,
  };

  const modifier = {
    $set: {
      answered: true,
    },
  };

  try {
    const { numberAffected } = Questions.upsert(selector, modifier);

    if (numberAffected) {
      Logger.verbose(`Answered question meetingId=${meetingId} questionId=${questionId}`);
    }
  } catch (err) {
    Logger.error(`Answering question: ${err}`);
  }
}
