import RedisPubSub from '/imports/startup/server/redis';
import QuestionQuizs from '/imports/api/question-quiz';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';

export default function publishQuestionQuiz() {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ShowQuestionQuizResultReqMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);
    check(meetingId, String);
    check(requesterUserId, String);

    const questionQuiz = QuestionQuizs.findOne({ meetingId, isPublished: false });
    if (!questionQuiz) {
      Logger.error(`Attempted to publish inexisting questionQuiz for meetingId: ${meetingId}`);
      return false;
    }
    RedisPubSub.publishUserMessage(
      CHANNEL,
      EVENT_NAME,
      meetingId,
      requesterUserId,
      ({ requesterId: requesterUserId, questionQuizId: questionQuiz.id }),
    );
  } catch (err) {
    Logger.error(`Exception while invoking method publishQuestionQuiz ${err.stack}`);
  }
}
