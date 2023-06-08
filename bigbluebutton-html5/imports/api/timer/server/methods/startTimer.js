import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function startTimer() {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'StartTimerReqMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);
    check(meetingId, String);
    check(requesterUserId, String);

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, {});
  } catch (err) {
    Logger.error(`Starting timer: ${err}`);
  }
}
