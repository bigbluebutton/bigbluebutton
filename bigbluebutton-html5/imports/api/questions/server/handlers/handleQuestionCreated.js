import { check } from 'meteor/check';
import addQuestion from '/imports/api/questions/server/modifiers/addQuestion';

export default function handleQuestionCreated({ header, body }, meetingId) {
  const { userId } = header;
  const { questionId, userName, text, timestamp, approved } = body;

  check(meetingId, String);
  check(userId, String)
  check(questionId, String);
  check(userName, String);
  check(text, String);
  check(timestamp, Number);
  check(approved, Boolean);

  addQuestion(meetingId, userId, questionId, userName, text, timestamp, approved);
}
