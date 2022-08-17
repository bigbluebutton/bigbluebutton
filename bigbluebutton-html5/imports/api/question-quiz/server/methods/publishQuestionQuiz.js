import RedisPubSub from '/imports/startup/server/redis';
import QuestionQuizs from '/imports/api/question-quiz';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';
import handleSendPrivateChatToUsersForPublishedQuestionQuiz from '../handlers/sendQuestionQuizPrivateChatMsg'

export default function publishQuestionQuiz(isPrivateChatAllowed, messageLabels, notAttemptedUsers) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ShowQuestionQuizResultReqMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);

    const questionQuiz = QuestionQuizs.findOne({ meetingId, isPublished: false });
     // TODO--send questionQuizid from client
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

    if(isPrivateChatAllowed){
      const {responses, answers, question} = questionQuiz
      handleSendPrivateChatToUsersForPublishedQuestionQuiz(this.userId, question, responses, answers, messageLabels, notAttemptedUsers)
    }
  } catch (err) {
    Logger.error(`Exception while invoking method publishQuestionQuiz ${err.stack}`);
  }
}
