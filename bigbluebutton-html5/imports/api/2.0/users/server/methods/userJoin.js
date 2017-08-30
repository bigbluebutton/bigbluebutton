import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis2x';
import Logger from '/imports/startup/server/logger';
import { buildMessageHeader } from '/imports/api/common/server/helpers';

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

  Logger.info(`User '${userId}' is joining meeting '${meetingId}'`);

  const header = buildMessageHeader(EVENT_NAME, meetingId, userId);

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, meetingId, payload, header);
}
