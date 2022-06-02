import { check } from 'meteor/check';
import updateQuestionQuiz from '../modifiers/updateQuestionQuiz';
import publishAllQuestionQuizs from '../modifiers/publishAllQuestionQuizs';

export default function questionQuizStopped({ body }, meetingId) {
  const { questionQuiz } = body;

  check(meetingId, String);

  if (questionQuiz) {
    const { questionQuizId } = questionQuiz;

    check(questionQuizId, String);

    return updateQuestionQuiz(meetingId, questionQuizId);
  }

  return publishAllQuestionQuizs(meetingId);
}
