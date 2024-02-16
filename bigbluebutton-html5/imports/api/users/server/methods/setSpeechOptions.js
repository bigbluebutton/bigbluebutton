import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default async function setSpeechOptions(partialUtterances, minUtteranceLength) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    const REDIS_CONFIG = Meteor.settings.private.redis;
    const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
    const EVENT_NAME = 'SetUserSpeechOptionsReqMsg';

    Logger.info(`Setting speech options for ${meetingId} ${requesterUserId} ${partialUtterances} ${minUtteranceLength}`);

    check(meetingId, String);
    check(requesterUserId, String);
    check(partialUtterances, Boolean);
    check(minUtteranceLength, Number);

    const payload = {
      partialUtterances,
      minUtteranceLength,
    };

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (e) {
    Logger.error(e);
  }
}
