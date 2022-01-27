import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default function updatePad(meetingId, userId, externalId, text) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'PadUpdatePubMsg';

  try {
    check(meetingId, String);
    check(userId, String);
    check(externalId, String);
    check(text, String);

    const payload = {
      externalId,
      text,
    };

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, userId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method updatePad ${err.stack}`);
  }
}
