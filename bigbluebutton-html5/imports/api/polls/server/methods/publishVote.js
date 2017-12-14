import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';
import Polls from '/imports/api/polls';
import Logger from '/imports/startup/server/logger';

export default function publishVote(credentials, id, pollAnswerId) { // TODO discuss location
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'RespondToPollReqMsg';

  const { meetingId, requesterUserId } = credentials;

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

  check(meetingId, String);
  check(requesterUserId, String);
  check(pollAnswerId, Number);
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

    return Logger.info(`Updating Polls collection (meetingId: ${meetingId},
                                            pollId: ${currentPoll.id}!)`);
  };

  Polls.update(selector, modifier, cb);

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
