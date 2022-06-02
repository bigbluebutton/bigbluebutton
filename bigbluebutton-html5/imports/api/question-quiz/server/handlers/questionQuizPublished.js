import { check } from 'meteor/check';
import setPublishedQuestionQuiz from '../../../meetings/server/modifiers/setPublishedQuestionQuiz';
import handleSendSystemChatForPublishedQuestionQuiz from './sendQuestionQuizChatMsg';

const QUESTION_QUIZ_CHAT_MESSAGE = Meteor.settings.public.questionQuiz.chatMessage;

export default function questionQuizPublished({ body }, meetingId) {
  const { questionQuizId } = body;
  check(meetingId, String);
  check(questionQuizId, String);

  setPublishedQuestionQuiz(meetingId, true);

  if (QUESTION_QUIZ_CHAT_MESSAGE) {
    handleSendSystemChatForPublishedQuestionQuiz({ body }, meetingId);
  }
}
