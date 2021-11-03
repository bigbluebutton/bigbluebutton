import { check } from 'meteor/check';
import Polls from '/imports/api/polls';
import RedisPubSub from '/imports/startup/server/redis';

export default function userTypedResponse({ header, body }) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'RespondToPollReqMsg';

  const { pollId, userId, answer } = body;
  const { meetingId } = header;

  check(pollId, String);
  check(meetingId, String);
  check(userId, String);
  check(answer, String);

  const poll = Polls.findOne({ meetingId, id: pollId });

  let answerId = 0;
  poll.answers.forEach((a) => {
    const { id, key } = a;
    if (key === answer) answerId = id;
  });

  const payload = {
    requesterId: userId,
    pollId,
    questionId: 0,
    answerIds: [answerId],
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, userId, payload);
}
