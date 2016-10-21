import Polls from '/imports/api/polls';
import { check } from 'meteor/check';
import { logger } from '/imports/startup/server/logger';

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

  return Polls.update({
    meetingId: meetingId,
    requester: requesterId,
    poll: { id: id },
  }, {
    $set: {
      poll: { answers: answers },
      poll: { num_responders: numResponders },
      poll: { num_respondents: numRespondents },
    },
  }, logger.info(`updating Polls Collection (meetingId: ${meetingId}, pollId: ${id}!)`));
};
