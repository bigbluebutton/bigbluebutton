import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import updateTimer from '/imports/api/timer/server/modifiers/updateTimer';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function timerEnded() {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);
  check(meetingId, String);
  check(requesterUserId, String);

  updateTimer({
    action: 'ended',
    meetingId,
    requesterUserId,
  });
}

// This method should only be used by the server
export function sysEndTimer(meetingId) {
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
