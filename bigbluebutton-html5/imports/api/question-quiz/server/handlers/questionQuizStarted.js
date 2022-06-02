import { check } from 'meteor/check';
import addQuestionQuiz from '../modifiers/addQuestionQuiz';
import setPublishedQuestionQuiz from '../../../meetings/server/modifiers/setPublishedQuestionQuiz';

export default function questionQuizStarted({ body }, meetingId) {
  const {
    userId, questionQuiz, questionQuizType, secretQuestionQuiz, question,
  } = body;
  check(meetingId, String);
  check(userId, String);
  check(questionQuiz, Object);
  check(questionQuizType, String);
  check(secretQuestionQuiz, Boolean);
  check(question, String);

  setPublishedQuestionQuiz(meetingId, false);

  return addQuestionQuiz(meetingId, userId,
  questionQuiz, questionQuizType, secretQuestionQuiz, question);
}
