import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function setEmojiStatus(userId, status) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ChangeUserEmojiCmdMsg';

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(userId, String);

  const payload = {
    emoji: status,
    userId,
  };

  Logger.verbose('User emoji status updated', {
    userId, status, requesterUserId, meetingId,
  });

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
