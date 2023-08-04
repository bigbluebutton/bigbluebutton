import { check } from 'meteor/check';
import removeQuestion from '/imports/api/questions/server/modifiers/removeQuestion';

export default function handleQuestionApproved({ body }, meetingId) {
  const { questionId } = body;

  check(meetingId, String);
  check(questionId, String);

  removeQuestion(meetingId, questionId);
}