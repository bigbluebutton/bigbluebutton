import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

const REDIS_CONFIG = Meteor.settings.private.redis;
const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
const EVENT_NAME = 'SetGuestPolicyCmdMsg';

export default function changeGuestPolicy(policyRule) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(policyRule, String);

    const payload = {
      setBy: requesterUserId,
      policy: policyRule,
    };

    Logger.info(`User=${requesterUserId} change guest policy to ${policyRule}`);

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method changeGuestPolicy ${err.stack}`);
  }
}
