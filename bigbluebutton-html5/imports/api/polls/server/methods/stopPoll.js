import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';

export default function stopPoll() {
  const { meetingId, requesterUserId: requesterId } = extractCredentials(this.userId);

  check(meetingId, String);
  check(requesterId, String);

  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'StopPollReqMsg';

  return RedisPubSub.publishUserMessage(
    CHANNEL,
    EVENT_NAME,
    meetingId,
    requesterId,
    ({ requesterId }),
  );
}
