import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function setPublishedQuestionQuiz(meetingId, isPublished) {
  check(meetingId, String);
  check(isPublished, Boolean);

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: {
      publishedQuestionQuiz: isPublished,
    },
  };

  try {
    const { numberAffected } = Meetings.upsert(selector, modifier);
    if (numberAffected) {
      Logger.info(`Set publishedQuestionQuiz=${isPublished} in meeitingId=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Setting publishedQuestionQuiz=${isPublished} for meetingId=${meetingId}`);
  }
}
