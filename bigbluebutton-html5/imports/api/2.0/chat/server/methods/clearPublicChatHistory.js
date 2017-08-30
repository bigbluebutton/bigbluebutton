import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis2x';
import { buildMessageHeader } from '/imports/api/common/server/helpers';

export default function clearPublicChatHistory(credentials) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  const eventName = 'ClearPublicChatHistoryPubMsg';

  const payload = {};

  const header = buildMessageHeader(EVENT_NAME, meetingId, requesterUserId);

  return RedisPubSub.publish(CHANNEL, eventName, meetingId, payload, header);
}
