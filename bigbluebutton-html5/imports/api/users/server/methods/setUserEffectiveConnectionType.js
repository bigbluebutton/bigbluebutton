import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import setEffectiveConnectionType from '../modifiers/setUserEffectiveConnectionType';

export default function setUserEffectiveConnectionType(effectiveConnectionType) {
  try {
    const REDIS_CONFIG = Meteor.settings.private.redis;
    const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
    const EVENT_NAME = 'ChangeUserEffectiveConnectionMsg';
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(effectiveConnectionType, String);

    const payload = {
      meetingId,
      userId: requesterUserId,
      effectiveConnectionType,
    };

    setEffectiveConnectionType(meetingId, requesterUserId, effectiveConnectionType);

    Logger.verbose('Updated user effective connection', { requesterUserId, effectiveConnectionType });

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method setUserEffectiveConnectionType ${err.stack}`);
  }
}
