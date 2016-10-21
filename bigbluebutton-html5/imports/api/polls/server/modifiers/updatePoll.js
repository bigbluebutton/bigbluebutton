import Polls from '/imports/api/polls';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default function updatePoll(poll, meetingId, requesterId) {
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
      poll: { answers: answers },
      poll: { num_responders: numResponders },
      poll: { num_respondents: numRespondents },
    },
  };

  const cb = (err, numChanged) => {
    if (err != null) {
      return Logger.error(`updating Polls collection: ${err}`);
    }

    Logger.info(`updating Polls collection (meetingId: ${meetingId}, pollId: ${id}!)`);
  };

  return Polls.update(selector, modifier, cb);
};
