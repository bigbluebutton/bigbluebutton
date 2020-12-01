import Polls from '/imports/api/polls';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import flat from 'flat';

export default function updateVotes(poll, meetingId) {
  check(meetingId, String);
  check(poll, Object);

  const {
    id,
    answers,
    numResponders,
    numRespondents,
  } = poll;

  check(id, String);
  check(answers, Array);

  check(numResponders, Number);
  check(numRespondents, Number);

  const selector = {
    meetingId,
    id,
  };

  const modifier = {
    $set: flat(poll, { safe: true }),
  };

  try {
    const numberAffected = Polls.update(selector, modifier);

    if (numberAffected) {
      Logger.info(`Updating Polls collection (meetingId: ${meetingId}, pollId: ${id}!)`);
    }
  } catch (err) {
    Logger.error(`Updating Polls collection: ${err}`);
  }
}
