import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default function createPad(meetingId, userId, externalId, name) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'PadCreateReqMsg';

  try {
    check(meetingId, String);
    check(userId, String);
    check(externalId, String);
    check(name, String);

    const payload = {
      externalId,
      name,
    };

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, userId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method createPad ${err.stack}`);
  }
}
