import QuestionQuizs from '/imports/api/question-quiz';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default function removeQuestionQuiz(meetingId, id) {
  check(meetingId, String);
  check(id, String);

  const selector = {
    meetingId,
    id,
  };

  try {
    const numberAffected = QuestionQuizs.remove(selector);

    if (numberAffected) {
      Logger.info(`Removed QuestionQuiz id=${id}`);
    }
  } catch (err) {
    Logger.error(`Removing QuestionQuiz from collection: ${err}`);
  }
}
