import { UploadRequest } from '/imports/api/upload';
import Logger from '/imports/startup/server/logger';

export default function clearUploadRequest(meetingId) {
  if (meetingId) {
    return UploadRequest.remove({ meetingId }, () => {
      Logger.info(`Cleared UploadRequest (${meetingId})`);
    });
  }

  // clearing upload requests for the whole server
  return UploadRequest.remove({}, () => {
    Logger.info('Cleared UploadRequest (all)');
  });
}
