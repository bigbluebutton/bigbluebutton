import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function emitExternalVideoEvent(options) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UpdateExternalVideoPubMsg';

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(meetingId, String);
  check(requesterUserId, String);

  const { status, playerStatus } = options;

  const user = Users.findOne({ meetingId, userId: requesterUserId });

  if (user && user.presenter) {
    check(status, String);
    check(playerStatus, {
      rate: Match.Maybe(Number),
      time: Match.Maybe(Number),
      state: Match.Maybe(Boolean),
    });

    const rate = playerStatus.rate || 0;
    const time = playerStatus.time || 0;
    const state = playerStatus.state || 0;
    const payload = {
      status, rate, time, state,
    };

    Logger.debug(`User id=${requesterUserId} sending ${EVENT_NAME} event:${state} for meeting ${meetingId}`);
    return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  }
}
