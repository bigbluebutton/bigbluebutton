import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';
import Polls from '/imports/api/polls';
import Logger from '/imports/startup/server/logger';

export default function publishPoll(credentials) {
  const { meetingId, requesterUserId } = credentials;
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ShowPollResultReqMsg';

  check(meetingId, String);
  check(requesterUserId, String);

  const poll = Polls.findOne({ meetingId });
  if (!poll) {
    Logger.error(`Attempted to publish inexisting poll for meetingId: ${meetingId}`);
    return false;
  }

  return RedisPubSub.publishUserMessage(
    CHANNEL,
    EVENT_NAME,
    meetingId,
    requesterUserId,
    ({ requesterId: requesterUserId, pollId: poll.id }),
  );
}
