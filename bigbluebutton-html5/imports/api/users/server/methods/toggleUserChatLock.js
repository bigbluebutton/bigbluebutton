import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function toggleUserChatLock(userId, isLocked) {
  try {
    const REDIS_CONFIG = Meteor.settings.private.redis;
    const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
    const EVENT_NAME = 'LockUserChatInMeetingCmdMsg';

    const { meetingId, requesterUserId: lockedBy } = extractCredentials(this.userId);

    check(meetingId, String);
    check(lockedBy, String);
    check(userId, String);
    check(isLocked, Boolean);

    const payload = {
      lockedBy,
      userId,
      isLocked,
    };

    Logger.verbose('Updated chat lock status for user', {
      meetingId, userId, isLocked, lockedBy,
    });

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, lockedBy, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method toggleUserChatLock ${err.stack}`);
  }
}
