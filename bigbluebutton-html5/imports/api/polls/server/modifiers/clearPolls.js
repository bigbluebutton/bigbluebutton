import Polls from '/imports/api/polls';
import { check } from 'meteor/check';
import { logger } from '/imports/startup/server/logger';

export default function clearPolls(meetingId, pollId) {
  //TODO make it so you can delete the polls based only on meetingId
  check(meetingId, String);
  check(pollId, String);

  if (meetingId && pollId) {
    return Polls.remove({
      meetingId: meetingId,
      'poll.id': pollId,
    }, logger.info(`cleared Polls Collection (meetingId: ${meetingId}, pollId: ${pollId}!)`));
  } else {
    return Polls.remove({}, logger.info('cleared Polls Collection (all meetings)!'));
  }
};
