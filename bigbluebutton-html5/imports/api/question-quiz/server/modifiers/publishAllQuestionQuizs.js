import QuestionQuizs from '/imports/api/question-quiz';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default function publisjAllQuestionQuizs(meetingId) {
  check(meetingId, String);

  const selector = {
    meetingId,
    isPublished: false
  };
  const modifier = {
      isPublished: true
  }

  try {
    const numberAffected = QuestionQuizs.update(selector, {$set: modifier});

    if (numberAffected) {
      Logger.info(`Published all Question Quizes in meeting id=${meetingId} to published=true`);
    }
  } catch (err) {
    Logger.error(`Cannot publish all QuestionQuizes from collection: ${err}`);
  }
}
