import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export default function addCaptionsPads(meetingId, padIds) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'AddCaptionsPadsSysMsg';

  check(meetingId, String);
  check(padIds, [String]);

  const payload = {
    padIds,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, 'nodeJSapp', payload);
}
