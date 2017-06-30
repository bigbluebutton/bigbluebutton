import Polls from '/imports/api/2.0/polls';
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

  const { numResponders } = poll;
  const { numRespondents } = poll;

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
      requester: requesterId,
      poll: {
        answers,
        num_responders: numResponders,
        num_respondents: numRespondents,
        id,
      },
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Updating Polls2x collection: ${err}`);
    }

    Logger.info(`Updating Polls2x collection (meetingId: ${meetingId}, pollId: ${id}!)`);
  };

  return Polls.update(selector, modifier, cb);
}
