import RedisPubSub from '/imports/startup/server/redis';
import Polls from '/imports/api/polls';
import { check } from 'meteor/check';

export default function startPoll(credentials, pollType, pollId, answers) {
  const { meetingId, requesterUserId } = credentials;
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;

  let EVENT_NAME = 'StartPollReqMsg';

  check(meetingId, String);
  check(requesterUserId, String);
  check(pollId, String);
  check(pollType, String);

  const payload = {
    requesterId: requesterUserId,
    pollId: `${pollId}/${new Date().getTime()}`,
    pollType,
  };

  if (pollType === 'custom') {
    EVENT_NAME = 'StartCustomPollReqMsg';
    check(answers, Array);
    payload.answers = answers;
  }

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
