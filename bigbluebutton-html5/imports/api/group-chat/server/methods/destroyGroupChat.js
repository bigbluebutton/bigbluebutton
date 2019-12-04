import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';

export default function createGroupChat(credentials) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  const eventName = 'DestroyGroupChatReqMsg';

  const payload = {
    // TODO: Implement this together with #4988
    // chats: Array[String],
  };

  return RedisPubSub.publishUserMessage(CHANNEL, eventName, meetingId, requesterUserId, payload);
}
