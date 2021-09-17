import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';

export default function startPoll(pollTypes, pollType, pollId, secretPoll, question, isMultipleResponse, answers) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  let EVENT_NAME = 'StartPollReqMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(pollId, String);
    check(pollType, String);
    check(secretPoll, Boolean);

    const payload = {
      requesterId: requesterUserId,
      pollId: `${pollId}/${new Date().getTime()}`,
      pollType,
      secretPoll,
      question,
      isMultipleResponse,
    };

    if (pollType === pollTypes.Custom) {
      EVENT_NAME = 'StartCustomPollReqMsg';
      check(answers, Array);
      payload.answers = answers;
    }

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method startPoll ${err.stack}`);
  }
}
