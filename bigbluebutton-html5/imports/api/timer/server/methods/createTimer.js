import { check } from 'meteor/check';
import { getInitialState, isEnabled } from '/imports/api/timer/server/helpers';
import addTimer from '/imports/api/timer/server/modifiers/addTimer';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';

// This method should only be used by the server
export default function createTimer(meetingId) {
  check(meetingId, String);

  // Avoid timer creation if this feature is disabled
  if (!isEnabled()) {
    Logger.warn(`Timers are disabled for ${meetingId}`);
    return;
  }

  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'CreateTimerPubMsg';

  try {
    addTimer(meetingId);
    const payload = getInitialState();

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, 'nodeJsApp', payload);
  } catch (err) {
    Logger.error(`Activating timer: ${err}`);
  }
}
