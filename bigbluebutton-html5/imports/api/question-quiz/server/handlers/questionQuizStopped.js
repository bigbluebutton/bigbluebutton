import { check } from 'meteor/check';
import removeQuestionQuiz from '../modifiers/removeQuestionQuiz';
import clearQuestionQuizs from '../modifiers/clearQuestionQuizs';

export default function questionQuizStopped({ body }, meetingId) {
  const { questionQuiz } = body;

  check(meetingId, String);

  if (questionQuiz) {
    const { questionQuizId } = questionQuiz;

    check(questionQuizId, String);

    return removeQuestionQuiz(meetingId, questionQuizId);
  }

  return clearQuestionQuizs(meetingId);
}
