import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default function destroyGroupChat() {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);

    const eventName = 'DestroyGroupChatReqMsg';

    const payload = {
      // TODO: Implement this together with #4988
      // chats: Array[String],
    };

    RedisPubSub.publishUserMessage(CHANNEL, eventName, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method createGroupChat ${err.stack}`);
  }
}
