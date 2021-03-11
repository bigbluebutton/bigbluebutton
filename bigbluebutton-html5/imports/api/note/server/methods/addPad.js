import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export default function addPad(meetingId, padId, readOnlyId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'AddPadSysMsg';

  check(meetingId, String);
  check(padId, String);
  check(readOnlyId, String);

  const payload = {
    padId,
    readOnlyId,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, 'nodeJSapp', payload);
}
