import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function getUserInformation(externalUserId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toThirdParty;
  const EVENT_NAME = 'LookUpUserReqMsg';

  const { meetingId, requesterUserId } = extractCredentials(this.userId);
  check(externalUserId, String);

  const payload = {
    externalUserId,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
