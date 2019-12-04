import Presentations from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';

export default function clearPresentations(meetingId, podId) {
  // clearing presentations for 1 pod
  if (meetingId && podId) {
    return Presentations.remove({ meetingId, podId }, () => {
      Logger.info(`Cleared Presentations (${meetingId}, ${podId})`);
    });
  }

  // clearing presentations for the whole meeting
  if (meetingId) {
    return Presentations.remove({ meetingId }, () => {
      Logger.info(`Cleared Presentations (${meetingId})`);
    });
  }

  // clearing presentations for the whole server
  return Presentations.remove({}, () => {
    Logger.info('Cleared Presentations (all)');
  });
}
