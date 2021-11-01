import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function emitExternalVideoEvent(options) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UpdateExternalVideoPubMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);

    const { status, playerStatus } = options;

    check(status, String);
    check(playerStatus, {
      rate: Match.Maybe(Number),
      time: Match.Maybe(Number),
      state: Match.Maybe(Number),
    });

    const state = playerStatus.state || 0;

    const payload = {
      status,
      rate: playerStatus.rate || 0,
      time: playerStatus.time || 0,
      state,
    };

    Logger.debug(`User id=${requesterUserId} sending ${EVENT_NAME} event:${state} for meeting ${meetingId}`);
    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method emitExternalVideoEvent ${err.stack}`);
  }
}
