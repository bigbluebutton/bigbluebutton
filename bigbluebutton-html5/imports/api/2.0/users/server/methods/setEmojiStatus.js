import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis2x';
import Logger from '/imports/startup/server/logger';
import { buildMessageHeader } from '/imports/api/common/server/helpers';

export default function setEmojiStatus(credentials, userId, status) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ChangeUserEmojiCmdMsg';

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(userId, String);

  const payload = {
    emoji: status,
    userId,
  };

  Logger.verbose(`User '${userId}' emoji status updated to '${status}' by '${
    requesterUserId}' from meeting '${meetingId}'`);

  const header = buildMessageHeader(EVENT_NAME, meetingId, requesterUserId);

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, meetingId, payload, header);
}
