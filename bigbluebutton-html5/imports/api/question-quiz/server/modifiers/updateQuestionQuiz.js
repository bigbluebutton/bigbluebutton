import QuestionQuizs from '/imports/api/question-quiz';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default function updateQuestionQuiz(meetingId, id) {
  check(meetingId, String);
  check(id, String);

  const selector = {
    meetingId,
    id,
    isPublished: false
  };
  const modifier = {
      isPublished: true
  }

  try {
    const numberAffected = QuestionQuizs.update(selector, {$set: modifier});

    if (numberAffected) {
      Logger.info(`Updated QuestionQuiz id=${id} to published=true`);
    }
  } catch (err) {
    Logger.error(`Cannot update QuestionQuiz from collection: ${err}`);
  }
}
