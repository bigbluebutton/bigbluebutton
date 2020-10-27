import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';
import Polls from '/imports/api/polls';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function publishVote(pollId, pollAnswerId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'RespondToPollReqMsg';

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(pollAnswerId, Number);
  check(pollId, String);

  const selector = {
    users: requesterUserId,
    meetingId,
    'answers.id': pollAnswerId,
  };

  const payload = {
    requesterId: requesterUserId,
    pollId,
    questionId: 0,
    answerId: pollAnswerId,
  };

  /*
   We keep an array of people who were in the meeting at the time the poll
   was started. The poll is published to them only.
   Once they vote - their ID is removed and they cannot see the poll anymore
  */
  const modifier = {
    $pull: {
      users: requesterUserId,
    },
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Removing responded user from Polls collection: ${err}`);
    }

    return Logger.info(`Removed responded user=${requesterUserId} from poll (meetingId: ${meetingId}, `
      + `pollId: ${pollId}!)`);
  };

  Polls.update(selector, modifier, cb);

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
