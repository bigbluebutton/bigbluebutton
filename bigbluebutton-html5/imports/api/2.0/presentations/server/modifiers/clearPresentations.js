import Presentations from '/imports/api/2.0/presentations';
import Logger from '/imports/startup/server/logger';

export default function clearPresentations(meetingId) {
  if (meetingId) {
    return Presentations.remove({ meetingId },
      Logger.info(`Cleared Presentations2x (${meetingId})`));
  }
  return Presentations.remove({}, Logger.info('Cleared Presentations (all)'));
}
