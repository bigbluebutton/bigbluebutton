import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Users from '/imports/api/users';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';

export default function userActivitySign(credentials) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UserActivitySignCmdMsg';

  const { meetingId, requesterUserId: userId } = credentials;

  check(meetingId, String);
  check(userId, String);

  const payload = {
    userId,
  };

  const selector = {
    userId,
  };

  const modifier = {
    $set: {
      inactivityCheck: false,
    },
  };

  Users.update(selector, modifier);

  Logger.info(`User ${userId} sent a activity sign for meeting ${meetingId}`);

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, userId, payload);
}
