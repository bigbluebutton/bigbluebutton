import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis2x';
import Logger from '/imports/startup/server/logger';

export default function userJoin(meetingId, userId, authToken) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UserJoinMeetingReqMsg';

  check(meetingId, String);
  check(userId, String);
  check(authToken, String);

  const payload = {
    userId,
    authToken,
  };

  const header = {
    name: EVENT_NAME,
    meetingId,
    userId,
  };

  Logger.info(`User '${userId}' is joining meeting '${meetingId}'`);

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, meetingId, payload, header);
}
