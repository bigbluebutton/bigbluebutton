import Polls from '/imports/api/polls';
import { logger } from '/imports/startup/server/logger';

export function clearPollCollection() {
  const meetingId = arguments[0];
  const pollId = arguments[1];

  //TODO make it so you can delete the polls based only on meetingId
  if (meetingId != null && pollId != null && Polls.findOne({
    meetingId: meetingId,
    poll: { id: pollId },
  }) != null) {
    return Polls.remove({
      meetingId: meetingId,
      'poll.id': pollId,
    }, logger.info(`cleared Polls Collection (meetingId: ${meetingId}, pollId: ${pollId}!)`));
  } else {
    return Polls.remove({}, logger.info('cleared Polls Collection (all meetings)!'));
  }
};
