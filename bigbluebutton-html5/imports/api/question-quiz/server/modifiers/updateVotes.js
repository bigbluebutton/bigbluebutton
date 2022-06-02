import QuestionQuizs from '/imports/api/question-quiz';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import flat from 'flat';
import Service from '/imports/api/question-quiz/server/service'

export default function updateVotes(questionQuiz, meetingId) {
  questionQuiz.answers = Service.checkCorrectAnswers(questionQuiz.answers)
  check(meetingId, String);
  check(questionQuiz, Object);

  const {
    id,
    answers,
    numResponders,
    numRespondents,
  } = questionQuiz;

  check(id, String);
  check(answers, Array);

  check(numResponders, Number);
  check(numRespondents, Number);

  const selector = {
    meetingId,
    id,
  };

  const modifier = {
    $set: flat(questionQuiz, { safe: true }),
  };

  try {
    const numberAffected = QuestionQuizs.update(selector, modifier);

    if (numberAffected) {
      Logger.info(`Updating QuestionQuizs collection vote (meetingId: ${meetingId}, questionQuizId: ${id}!)`);
    }
  } catch (err) {
    Logger.error(`Updating QuestionQuizs collection vote: ${err}`);
  }
}
