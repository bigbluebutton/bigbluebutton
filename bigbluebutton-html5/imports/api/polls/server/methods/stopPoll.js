import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';

export default function stopPoll(credentials) {
  const { meetingId, requesterUserId } = credentials;
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'StopPollReqMsg';

  check(meetingId, String);
  check(requesterUserId, String);

  return RedisPubSub.publishUserMessage(
    CHANNEL,
    EVENT_NAME,
    meetingId,
    requesterUserId,
    ({ requesterId: requesterUserId }),
  );
}
