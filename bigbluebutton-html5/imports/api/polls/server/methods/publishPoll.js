import RedisPubSub from '/imports/startup/server/redis';
import Polls from '/imports/api/polls';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';

export default async function publishPoll() {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ShowPollResultReqMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);

    const poll = await Polls.findOneAsync({ meetingId }); // TODO--send pollid from client
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
  //In this case we return true because
  //lint asks for async functions to return some value.
  return true;
}
