import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function createQuestion(body) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'CreateQuestionPubMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);
    const { userName, text, extUserId } = body;

    check(meetingId, String);
    check(requesterUserId, String);
    check(extUserId, String);
    check(userName, String);
    check(text, String);

    if (text.length !== 0) {
      const payload = {
        userName,
        extUserId,
        text,
      };

      RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
    }
  } catch (err) {
    Logger.error(`Creating question: ${err}`);
  }
}
