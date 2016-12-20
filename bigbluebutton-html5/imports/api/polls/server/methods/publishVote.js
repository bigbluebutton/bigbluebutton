import { isAllowedTo } from '/imports/startup/server/userPermissions';
import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';
import Polls from '/imports/api/polls';
import Logger from '/imports/startup/server/logger';

export default function publishVote(credentials, pollId, pollAnswerId) { //TODO discuss location
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toBBBApps.polling;
  const EVENT_NAME = 'vote_poll_user_request_message';

  if (!isAllowedTo('subscribePoll', credentials)) {
    throw new Meteor.Error('not-allowed', `You are not allowed to publishVote`);
  }

  const { meetingId, requesterUserId, requesterToken } = credentials;

  const currentPoll = Polls.findOne({
    users: requesterUserId,
    meetingId: meetingId,
    'poll.answers.id': pollAnswerId,
    'poll.id': pollId,
  });

  check(meetingId, String);
  check(requesterUserId, String);
  check(pollAnswerId, Number);
  check(currentPoll.meetingId, String);

  let payload = {
    meeting_id: currentPoll.meetingId,
    user_id: requesterUserId,
    poll_id: currentPoll.poll.id,
    question_id: 0,
    answer_id: pollAnswerId,
  };

  const selector = {
    users: requesterUserId,
    meetingId: meetingId,
    'poll.answers.id': pollAnswerId,
  };

  const modifier = {
    $pull: {
      users: requesterUserId,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Updating Polls collection: ${err}`);
    }

    Logger.info(`Updating Polls collection (meetingId: ${meetingId},
                                            pollId: ${currentPoll.poll.id}!)`);
  };

  Polls.update(selector, modifier, cb);
  return RedisPubSub.publish(CHANNEL, EVENT_NAME, payload);
}
