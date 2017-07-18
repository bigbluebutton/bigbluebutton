import RedisPubSub from '/imports/startup/server/redis2x';
import { check } from 'meteor/check';
import Polls from '/imports/api/2.0/polls';
import Logger from '/imports/startup/server/logger';

export default function publishVote(credentials, pollId, pollAnswerId) { // TODO discuss location
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'RespondToPollReqMsg';

  const { meetingId, requesterUserId } = credentials;

  const currentPoll = Polls.findOne({
    users: requesterUserId,
    meetingId,
    'poll.answers.id': pollAnswerId,
    'poll.id': pollId,
  });

  check(meetingId, String);
  check(requesterUserId, String);
  check(pollAnswerId, Number);
  check(currentPoll.meetingId, String);

  const payload = {
    requesterId: requesterUserId,
    pollId: currentPoll.poll.id,
    questionId: 0,
    answerId: pollAnswerId,
  };

  const header = {
    meetingId,
    name: EVENT_NAME,
    userId: requesterUserId,
  };

  const selector = {
    users: requesterUserId,
    meetingId,
    'poll.answers.id': pollAnswerId,
  };

  const modifier = {
    $pull: {
      users: requesterUserId,
    },
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Updating Polls2x collection: ${err}`);
    }

    return Logger.info(`Updating Polls2x collection (meetingId: ${meetingId},
                                            pollId: ${currentPoll.poll.id}!)`);
  };

  Polls.update(selector, modifier, cb);
  return RedisPubSub.publish(CHANNEL, EVENT_NAME, meetingId, payload, header);
}
