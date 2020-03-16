import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';
import Polls from '/imports/api/polls';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function publishVote(id, pollAnswerId) { // TODO discuss location
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'RespondToPollReqMsg';

  const { meetingId, requesterUserId } = extractCredentials(this.userId);
  /*
   We keep an array of people who were in the meeting at the time the poll
   was started. The poll is published to them only.
   Once they vote - their ID is removed and they cannot see the poll anymore
   */
  const currentPoll = Polls.findOne({
    users: requesterUserId,
    meetingId,
    'answers.id': pollAnswerId,
    id,
  });

  check(pollAnswerId, Number);
  check(currentPoll, Object);
  check(currentPoll.meetingId, String);

  const payload = {
    requesterId: requesterUserId,
    pollId: currentPoll.id,
    questionId: 0,
    answerId: pollAnswerId,
  };

  const selector = {
    users: requesterUserId,
    meetingId,
    'answers.id': pollAnswerId,
  };

  const modifier = {
    $pull: {
      users: requesterUserId,
    },
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Updating Polls collection: ${err}`);
    }

    return Logger.info(`Updating Polls collection (meetingId: ${meetingId}, `
      + `pollId: ${currentPoll.id}!)`);
  };

  Polls.update(selector, modifier, cb);

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
