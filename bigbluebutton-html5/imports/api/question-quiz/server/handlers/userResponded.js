import { check } from 'meteor/check';
import QuestionQuizs from '/imports/api/question-quiz';
import Logger from '/imports/startup/server/logger';

export default function userResponded({ body }) {
  const { questionQuizId, userId, answerIds } = body;

  check(questionQuizId, String);
  check(userId, String);
  check(answerIds, Array);

  const selector = {
    id: questionQuizId,
  };

  const modifier = {
    $pull: {
      users: userId,
    },
    $push: {
      responses: { userId, answerIds },
    },
  };

  try {
    const numberAffected = QuestionQuizs.update(selector, modifier);

    if (numberAffected) {
      Logger.info(`Updating QuestionQuiz response (userId: ${userId}, response: ${JSON.stringify(answerIds)}, questionQuizId: ${questionQuizId})`);
    }
  } catch (err) {
    Logger.error(`Updating QuestionQuiz responses: ${err}`);
  }
}
