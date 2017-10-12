import Polls from '/imports/api/polls';
import Logger from '/imports/startup/server/logger';

export default function clearPolls(meetingId) {
  if (meetingId) {
    return Polls.remove({ meetingId }, Logger.info(`Cleared Polls2x (${meetingId})`));
  }

  return Polls.remove({}, Logger.info('Cleared Polls2x (all)'));
}
