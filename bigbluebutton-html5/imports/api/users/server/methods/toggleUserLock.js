import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';

export default function toggleUserLock(credentials, userId, lock) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'LockUserInMeetingCmdMsg';

  const { meetingId, requesterUserId: lockedBy } = credentials;

  check(meetingId, String);
  check(lockedBy, String);
  check(userId, String);
  check(lock, Boolean);

  const payload = {
    lockedBy,
    userId,
    lock,
  };

  Logger.verbose(`User ${lockedBy} updated lock status from ${userId} to ${lock}
  in meeting ${meetingId}`);


  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, lockedBy, payload);
}
