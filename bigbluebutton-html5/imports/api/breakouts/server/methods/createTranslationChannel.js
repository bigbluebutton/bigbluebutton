import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function createTranslationChannel(language) {

  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  const eventName = 'CreateTranslationChannelCmdMsg';
  const payload = {
    language
  };

  return RedisPubSub.publishUserMessage(CHANNEL, eventName, meetingId, requesterUserId, payload);
}
