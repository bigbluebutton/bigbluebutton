import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default function addCaptionsPads(meetingId, padIds) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'AddCaptionsPadsSysMsg';

  try {
    check(meetingId, String);
    check(padIds, [String]);

    const payload = {
      padIds,
    };

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, 'nodeJSapp', payload);
  } catch (err) {
    Logger.error(`Exception while invoking method addCaptionsPads ${err.stack}`);
  }
}
