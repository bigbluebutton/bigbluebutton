import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function removeUser(userId, banUser) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'EjectUserFromMeetingCmdMsg';

  const { meetingId, requesterUserId: ejectedBy } = extractCredentials(this.userId);

  check(userId, String);

  const payload = {
    userId,
    ejectedBy,
    banUser,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, ejectedBy, payload);
}
