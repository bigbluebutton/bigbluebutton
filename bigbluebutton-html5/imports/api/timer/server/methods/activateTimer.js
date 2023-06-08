import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { getInitialState } from '../helpers';

export default function activateTimer() {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ActivateTimerReqMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);
    check(meetingId, String);
    check(requesterUserId, String);

    const payload = getInitialState();

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Activating timer: ${err}`);
  }
}
