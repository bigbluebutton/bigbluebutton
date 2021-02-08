import PresentationUploadToken from '/imports/api/presentation-upload-token';
import Logger from '/imports/startup/server/logger';

export default function clearPresentationUploadToken(meetingId, podId) {
  if (meetingId && podId) {
    try {
      const numberAffected = PresentationUploadToken.remove({ meetingId, podId });

      if (numberAffected) {
        Logger.info(`Cleared Presentations Upload Token (${meetingId}, ${podId})`);
        return true;
      }
    } catch (err) {
      Logger.info(`Error on clearing Presentations Upload Token (${meetingId}, ${podId}). ${err}`);
      return false;
    }
  }

  if (meetingId) {
    try {
      const numberAffected = PresentationUploadToken.remove({ meetingId });

      if (numberAffected) {
        Logger.info(`Cleared Presentations Upload Token (${meetingId})`);
      }
    } catch (err) {
      Logger.info(`Error on clearing Presentations Upload Token (${meetingId}). ${err}`);
    }
  } else {
    try {
      // clearing presentations for the whole server
      const numberAffected = PresentationUploadToken.remove({});

      if (numberAffected) {
        Logger.info('Cleared Presentations Upload Token (all)');
      }
    } catch (err) {
      Logger.info(`Error on clearing Presentations Upload Token (all). ${err}`);
    }
  }
}
