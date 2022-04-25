import { check } from 'meteor/check';
import QuestionQuizs from '/imports/api/question-quiz';
import RedisPubSub from '/imports/startup/server/redis';

export default function userTypedResponse({ header, body }) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'RespondToQuestionQuizReqMsg';

  const { questionQuizId, userId, answer } = body;
  const { meetingId } = header;

  check(questionQuizId, String);
  check(meetingId, String);
  check(userId, String);
  check(answer, String);

  const questionQuiz = QuestionQuizs.findOne({ meetingId, id: questionQuizId });

  let answerId = 0;
  questionQuiz.answers.forEach((a) => {
    const { id, key } = a;
    if (key === answer) answerId = id;
  });

  const payload = {
    requesterId: userId,
    questionQuizId,
    questionId: 0,
    answerIds: [answerId],
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, userId, payload);
}
