import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function startPoll(pollType, pollId, question, answers) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;

  let EVENT_NAME = 'StartPollReqMsg';

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(meetingId, String);
  check(requesterUserId, String);
  check(pollId, String);
  check(pollType, String);

  const payload = {
    requesterId: requesterUserId,
    pollId: `${pollId}/${new Date().getTime()}`,
    pollType,
    question,
  };

  if (pollType === 'custom') {
    EVENT_NAME = 'StartCustomPollReqMsg';
    check(answers, Array);
    payload.answers = answers;
  }

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
