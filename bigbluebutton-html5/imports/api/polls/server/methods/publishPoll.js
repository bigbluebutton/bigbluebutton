import RedisPubSub from '/imports/startup/server/redis';
import Polls from '/imports/api/polls';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';

export default function publishPoll() {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ShowPollResultReqMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);

    const poll = Polls.findOne({ meetingId }); // TODO--send pollid from client
    if (!poll) {
      Logger.error(`Attempted to publish inexisting poll for meetingId: ${meetingId}`);
      return false;
    }

    RedisPubSub.publishUserMessage(
      CHANNEL,
      EVENT_NAME,
      meetingId,
      requesterUserId,
      ({ requesterId: requesterUserId, pollId: poll.id }),
    );
  } catch (err) {
    Logger.error(`Exception while invoking method publishPoll ${err.stack}`);
  }
}
