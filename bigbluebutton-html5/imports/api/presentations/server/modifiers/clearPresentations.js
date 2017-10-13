import Presentations from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';

export default function clearPresentations(meetingId) {
  if (meetingId) {
    return Presentations.remove({ meetingId },
      Logger.info(`Cleared Presentations (${meetingId})`));
  }
  return Presentations.remove({}, Logger.info('Cleared Presentations (all)'));
}
