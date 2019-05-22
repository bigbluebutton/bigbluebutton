import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import RedisPubSub from '/imports/startup/server/redis';

export default function updateExternalVideoStatus(credentials, options) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UpdateExternalVideoStatusMsg';

  const { meetingId, requesterUserId } = credentials;
  const { eventName, playerStatus } = options;

  check(meetingId, String);
  check(requesterUserId, String);

  const payload = { eventName, playerStatus };

  Logger.info(`User id=${requesterUserId} sending video status: ${eventName} for meeting ${meetingId}`);

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
