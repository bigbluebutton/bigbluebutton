import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function changePin(userId, pin) {
  try {
    const REDIS_CONFIG = Meteor.settings.private.redis;
    const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
    const EVENT_NAME = 'ChangeUserPinStateReqMsg';
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(userId, String);
    check(pin, Boolean);

    const payload = {
      pin,
      changedBy: requesterUserId,
      userId,
    };

    Logger.verbose('User pin requested', {
      userId, meetingId, changedBy: requesterUserId, pin,
    });

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method changePin ${err.stack}`);
  }
}
