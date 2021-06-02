import { Meteor } from 'meteor/meteor';
import Users from '/imports/api/users';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';

export default function userActivitySign() {
  try {
    const REDIS_CONFIG = Meteor.settings.private.redis;
    const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
    const EVENT_NAME = 'UserActivitySignCmdMsg';
    const { meetingId, requesterUserId: userId } = extractCredentials(this.userId);

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

    Users.update(selector, modifier); // TODO-- we should move this to a modifier

    Logger.info(`User ${userId} sent a activity sign for meeting ${meetingId}`);

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, userId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method userActivitySign ${err.stack}`);
  }
}
