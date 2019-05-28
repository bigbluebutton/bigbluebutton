import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import RedisPubSub from '/imports/startup/server/redis';

export default function updateExternalVideoStatus(credentials, options) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UpdateExternalVideoPubMsg';

  const { meetingId, requesterUserId } = credentials;
  const { status, playerStatus } = options;

  check(meetingId, String);
  check(requesterUserId, String);
  check(status, String);
  check(playerStatus, {
    rate: Match.Maybe(Number),
    time: Number,
    state: Match.Maybe(Number),
  });

  let rate = playerStatus.rate || 0;
  let time = playerStatus.time;
  let state = playerStatus.state || 0;

  const payload = { status, rate, time, state };

  Logger.info(`User id=${requesterUserId} sending video status: ${status} for meeting ${meetingId}`);

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
