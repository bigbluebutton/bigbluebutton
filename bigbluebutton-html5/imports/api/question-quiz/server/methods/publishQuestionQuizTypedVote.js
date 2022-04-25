import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';
import QuestionQuizs from '/imports/api/question-quiz';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';

export default function publishQuestionQuizTypedVote(id, questionQuizAnswer) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const MAX_INPUT_CHARS = Meteor.settings.public.questionQuiz.maxTypedAnswerLength;
  let EVENT_NAME = 'RespondToTypedQuestionQuizReqMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(questionQuizAnswer, String);
    check(id, String);

    const allowedToVote = QuestionQuizs.findOne({
      id,
      users: { $in: [requesterUserId] },
      meetingId,
    }, {
      fields: {
        users: 1,
      },
    });

    if (!allowedToVote) {
      Logger.info(`QuestionQuiz User={${requesterUserId}} has already voted in QuestionQuizId={${id}}`);
      return null;
    }

    const activeQuestionQuiz = QuestionQuizs.findOne({ meetingId, id }, {
      fields: {
        answers: 1,
      },
    });

    let existingAnsId = null;
    activeQuestionQuiz.answers.forEach((a) => {
      if (a.key === questionQuizAnswer) existingAnsId = a.id;
    });
  
    if (existingAnsId !== null) {
      check(existingAnsId, Number);
      EVENT_NAME = 'RespondToQuestionQuizReqMsg';

      return RedisPubSub.publishUserMessage(
        CHANNEL,
        EVENT_NAME,
        meetingId,
        requesterUserId,
        {
          requesterId: requesterUserId,
          questionQuizId: id,
          questionId: 0,
          answerIds: [existingAnsId],
        },
      );
    }
  
    const payload = {
      requesterId: requesterUserId,
      questionQuizId: id,
      questionId: 0,
      answer: questionQuizAnswer.substring(0, MAX_INPUT_CHARS),
    };

    return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method publishTypedVote ${err.stack}`);
  }
}
