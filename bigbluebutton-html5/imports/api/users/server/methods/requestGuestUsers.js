import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';

export default function requestGuestUsers(meetingId, userId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'GetGuestsWaitingApprovalReqMsg';

  Logger.info(`User='${userId}' requested guest users`);
  check(meetingId, String);
  check(userId, String);

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, userId, {
    requesterId: userId,
  });
}
