import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default function stopPoll() {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'StopPollReqMsg';

  try {
    const { meetingId, requesterUserId: requesterId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterId, String);

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterId, ({ requesterId }));
  } catch (err) {
    Logger.error(`Exception while invoking method stopPoll ${err.stack}`);
  }
}
