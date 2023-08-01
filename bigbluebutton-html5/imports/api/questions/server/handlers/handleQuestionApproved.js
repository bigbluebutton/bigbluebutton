import { check } from 'meteor/check';
import updateQuestion from '/imports/api/questions/server/modifiers/updateQuestionApproved';

export default function handleQuestionApproved({ body }, meetingId) {
  const { questionId, approved } = body;

  check(meetingId, String);
  check(questionId, String);
  check(approved, Boolean);

  updateQuestion(meetingId, questionId, approved);
}