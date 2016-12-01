import Polls from '/imports/api/polls';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default function updateVotes(poll, meetingId, requesterId) {
  check(meetingId, String);
  check(requesterId, String);
  check(poll, Object);

  const {
    id,
    answers,
  } = poll;

  const numResponders = poll.num_responders;
  const numRespondents = poll.num_respondents;

  check(id, String);
  check(answers, Array);

  check(numResponders, Number);
  check(numRespondents, Number);

  const selector = {
    meetingId,
    requester: requesterId,
    'poll.id': id,
  };

  const modifier = {
    $set: {
      poll: {
        answers: answers,
        num_responders: numResponders,
        num_respondents: numRespondents,
      },
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Updating Polls collection: ${err}`);
    }

    Logger.info(`Updating Polls collection (meetingId: ${meetingId}, pollId: ${id}!)`);
  };

  return Polls.update(selector, modifier, cb);
};
