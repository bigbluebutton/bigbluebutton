import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';

const REDIS_CONFIG = Meteor.settings.private.redis;
const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
const EVENT_NAME = 'SetGuestPolicyCmdMsg';

export default function changeGuestPolicy(credentials, policyRule) {
  const {
    meetingId,
    requesterUserId,
    requesterToken,
  } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);
  check(policyRule, String);

  const payload = {
    setBy: requesterUserId,
    policy: policyRule,
  };

  Logger.info(`User=${requesterUserId} change guest policy to ${policyRule}`);

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
