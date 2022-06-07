import Presentations from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';

export default function clearPresentations(meetingId, podId) {
  // clearing presentations for 1 pod
  if (meetingId && podId) {
    try {
      const numberAffected = Presentations.remove({ meetingId, podId });

      if (numberAffected) {
        Logger.info(`Cleared Presentations (${meetingId}, ${podId})`);
        return true;
      }
    } catch (err) {
      Logger.error(`Error on cleaning Presentations (${meetingId}, ${podId}). ${err}`);
      return false;
    }
  }

  // clearing presentations for the whole meeting
  if (meetingId) {
    try {
      const numberAffected = Presentations.remove({ meetingId });

      if (numberAffected) {
        Logger.info(`Cleared Presentations (${meetingId})`);
      }
    } catch (err) {
      Logger.error(`Error on cleaning Presentations (${meetingId}). ${err}`);
    }
  } else {
    try {
      const numberAffected = Presentations.remove({});

      if (numberAffected) {
        Logger.info('Cleared Presentations (all)');
      }
    } catch (err) {
      Logger.error(`Error on cleaning Presentations (all). ${err}`);
    }
  }
}
