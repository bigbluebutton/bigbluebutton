import RedisPubSub from '/imports/startup/server/redis';
import Polls from '/imports/api/polls';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function publishPoll() {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ShowPollResultReqMsg';

  const { meetingId, requesterUserId } = extractCredentials(this.userId);
  const poll = Polls.findOne({ meetingId }); // TODO--send pollid from client
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
