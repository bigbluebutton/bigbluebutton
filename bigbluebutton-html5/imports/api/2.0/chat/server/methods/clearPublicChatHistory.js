import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis2x';

export default function clearPublicChatHistory(credentials) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  const eventName = 'ClearPublicChatHistoryPubMsg';

  const header = {
    meetingId,
    name: eventName,
    userId: requesterUserId,
  };

  const body = {};

  return RedisPubSub.publish(CHANNEL, eventName, meetingId, body, header);
}
