import Presentations from '/imports/api/slides';
import Logger from '/imports/startup/server/logger';

export default function clearPresentations(meetingId) {
  if (meetingId) {
    return Presentations.remove({ meetingId: meetingId },
      Logger.info(`Cleared Presentations (${meetingId})`));
  } else {
    return Presentations.remove({}, Logger.info('Cleared Presentations (all)'));
  }
};
