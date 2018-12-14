import PresentationUploadToken from '/imports/api/presentation-upload-token';
import Logger from '/imports/startup/server/logger';

export default function clearPresentationUploadToken(meetingId, podId) {
  if (meetingId && podId) {
    return PresentationUploadToken.remove({ meetingId, podId }, () => {
      Logger.info(`Cleared Presentations Upload Token (${meetingId}, ${podId})`);
    });
  }

  if (meetingId) {
    return PresentationUploadToken.remove({ meetingId }, () => {
      Logger.info(`Cleared Presentations Upload Token (${meetingId})`);
    });
  }

  // clearing presentations for the whole server
  return PresentationUploadToken.remove({}, () => {
    Logger.info('Cleared Presentations Upload Token (all)');
  });
}
