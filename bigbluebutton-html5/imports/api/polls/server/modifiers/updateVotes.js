import Polls from '/imports/api/2.0/polls';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import flat from 'flat';

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
    id,
  };

  const modifier = {
    $set: Object.assign(
      { requester: requesterId },
      flat(poll, { safe: true }),
    ),
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Updating Polls2x collection: ${err}`);
    }

    return Logger.info(`Updating Polls2x collection (meetingId: ${meetingId}, pollId: ${id}!)`);
  };

  return Polls.update(selector, modifier, cb);
}
