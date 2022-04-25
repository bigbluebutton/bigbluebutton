import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';
import QuestionQuizs from '/imports/api/question-quiz';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function publishQuestionQuizVote(questionQuizId, questionQuizAnswerIds) {
  try {
    const REDIS_CONFIG = Meteor.settings.private.redis;
    const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
    const EVENT_NAME = 'RespondToQuestionQuizReqMsg';
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(questionQuizAnswerIds, Array);
    check(questionQuizId, String);

    const allowedToVote = QuestionQuizs.findOne({
      id: questionQuizId,
      users: { $in: [requesterUserId] },
      meetingId,
    }, {
      fields: {
        users: 1,
      },
    });

    if (!allowedToVote) {
      Logger.info(`QuestionQuiz User={${requesterUserId}} has already voted in QuestionQuizId={${questionQuizId}}`);
      return null;
    }

    const selector = {
      users: requesterUserId,
      meetingId,
      'answers.id': { $all: questionQuizAnswerIds },
    };

    const payload = {
      requesterId: requesterUserId,
      questionQuizId,
      questionId: 0,
      answerIds: questionQuizAnswerIds,
    };

    /*
     We keep an array of people who were in the meeting at the time the questionQuiz
     was started. The questionQuiz is published to them only.
     Once they vote - their ID is removed and they cannot see the questionQuiz anymore
    */
    const modifier = {
      $pull: {
        users: requesterUserId,
      },
    };

    const numberAffected = QuestionQuizs.update(selector, modifier);

    if (numberAffected) {
      Logger.info(`Removed responded user=${requesterUserId} from questionQuiz (meetingId: ${meetingId}, questionQuizId: ${questionQuizId}!)`);

      RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
    }
  } catch (err) {
    Logger.error(`Exception while invoking method publishVote ${err.stack}`);
  }
}
