import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Questions from '/imports/api/questions';

export default function removeQuestion(meetingId, questionId) {
  check(meetingId, String);
  check(questionId, String);

  const selector = {
    meetingId,
    questionId,
  };

  try {
    const { numberAffected } = Questions.remove(selector);

    if (numberAffected) {
      Logger.verbose(`Removed question meetingId=${meetingId} questionId=${questionId}`);
    }
  } catch (err) {
    Logger.error(`Removing question: ${err}`);
  }
}