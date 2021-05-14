import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default function addPad(meetingId, padId, readOnlyId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'AddPadSysMsg';

  try {
    check(meetingId, String);
    check(padId, String);
    check(readOnlyId, String);

    const payload = {
      padId,
      readOnlyId,
    };

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, 'nodeJSapp', payload);
  } catch (err) {
    Logger.error(`Exception while invoking method addPad ${err.stack}`);
  }
}
