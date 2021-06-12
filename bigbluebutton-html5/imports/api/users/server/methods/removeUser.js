import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';

export default function removeUser(userId, banUser) {
  try {
    const REDIS_CONFIG = Meteor.settings.private.redis;
    const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
    const EVENT_NAME = 'EjectUserFromMeetingCmdMsg';

    const { meetingId, requesterUserId: ejectedBy } = extractCredentials(this.userId);

    check(meetingId, String);
    check(ejectedBy, String);
    check(userId, String);
    check(banUser, Boolean);

    const payload = {
      userId,
      ejectedBy,
      banUser,
    };

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, ejectedBy, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method removeUser ${err.stack}`);
  }
}
