import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';
import { Meteor } from 'meteor/meteor';
export default function startQuestionQuiz(questionQuizTypes, questionQuizType, questionQuizId, secretQuestionQuiz, question, isMultipleResponse, answers) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  let EVENT_NAME = 'StartQuestionQuizReqMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(questionQuizId, String);
    check(questionQuizType, String);
    check(secretQuestionQuiz, Boolean);

    const payload = {
      requesterId: requesterUserId,
      questionQuizId: `${questionQuizId}/${new Date().getTime()}`,
      questionQuizType,
      secretQuestionQuiz,
      question,
      isMultipleResponse,
    };

    if (questionQuizType === questionQuizTypes.Custom) {
      EVENT_NAME = 'StartCustomQuestionQuizReqMsg';
      check(answers, Array);
      payload.answers = answers;
    }
    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method startQuestionQuiz ${err.stack}`);
  }
}
