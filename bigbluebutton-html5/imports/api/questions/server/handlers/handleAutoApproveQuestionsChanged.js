import { check } from 'meteor/check';
import setAutoApproveQuestions from '/imports/api/questions/server/modifiers/setAutoApproveQuestions';

export default function handleAutoApproveQuestionsChanged({ body }, meetingId) {
  const { autoApprove } = body;

  check(meetingId, String);
  check(autoApprove, Boolean);

  setAutoApproveQuestions(meetingId, autoApprove);
}