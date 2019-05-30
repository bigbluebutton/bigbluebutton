import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import setEffectiveConnectionType from '../modifiers/setUserEffectiveConnectionType';

export default function setUserEffectiveConnectionType(credentials, effectiveConnectionType) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ChangeUserEffectiveConnectionMsg';

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(effectiveConnectionType, String);

  const payload = {
    meetingId,
    userId: requesterUserId,
    effectiveConnectionType,
  };

  setEffectiveConnectionType(meetingId, requesterUserId, effectiveConnectionType);

  Logger.verbose(`User ${requesterUserId} effective connection updated to ${effectiveConnectionType}`);

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
