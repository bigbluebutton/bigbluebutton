import { check } from 'meteor/check';
import Timer from '/imports/api/timer';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';

export default function stopTimer(meetingId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'StopTimerReqMsg';
  const USER_ID = 'nodeJSapp';

  try {
    check(meetingId, String);
    const now = Date.now();
    const timer = Timer.findOne(
      { meetingId },
      {
        fields:
        {
          stopwatch: 1,
          time: 1,
          accumulated: 1,
          timestamp: 1,
        },
      },
    );

    if (timer) {
      const {
        timestamp,
      } = timer;

      const accumulated = timer.accumulated + (now - timestamp);

      const payload = {
        accumulated,
      };

      RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, USER_ID, payload);
    } else {
      Logger.warn(`Could not stop timer for meeting=${meetingId}, timer not found`);
    }
  } catch (err) {
    Logger.error(`Stopping timer: ${err}`);
  }
}
