import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';

export default function userTypedResponse({ header, body }) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'RespondToPollReqMsg';

  const { pollId, userId, answerId } = body;
  const { meetingId } = header;

  check(pollId, String);
  check(meetingId, String);
  check(userId, String);
  check(answerId, Number);

  const payload = {
    requesterId: userId,
    pollId,
    questionId: 0,
    answerId,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, userId, payload);
}
