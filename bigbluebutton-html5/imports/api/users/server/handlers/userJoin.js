import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';

export default function userJoin(meetingId, userId, authToken) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UserJoinMeetingReqMsg';

  check(authToken, String);

  const payload = {
    userId,
    authToken,
    clientType: 'HTML5',
  };

  Logger.info(`User='${userId}' is joining meeting='${meetingId}' authToken='${authToken}'`);

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, userId, payload);
}
