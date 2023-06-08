import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';

export default function endTimer(meetingId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'TimerEndedPubMsg';
  const USER_ID = 'nodeJSapp';

  try {
    check(meetingId, String);

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, USER_ID, {});
  } catch (err) {
    Logger.error(`Ending timer: ${err}`);
  }
}
