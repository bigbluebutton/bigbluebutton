import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function toggleUserLock(userId, lock) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'LockUserInMeetingCmdMsg';

  const { meetingId, requesterUserId: lockedBy } = extractCredentials(this.userId);

  check(lockedBy, String);
  check(userId, String);
  check(lock, Boolean);

  const payload = {
    lockedBy,
    userId,
    lock,
  };

  Logger.verbose('Updated lock status for user', {
    meetingId, userId, lock, lockedBy,
  });


  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, lockedBy, payload);
}
