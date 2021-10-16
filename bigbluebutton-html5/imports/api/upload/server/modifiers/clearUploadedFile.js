import { UploadedFile } from '/imports/api/upload';
import Logger from '/imports/startup/server/logger';

export default function clearUploadedFile(meetingId) {
  if (meetingId) {
    return UploadedFile.remove({ meetingId }, () => {
      Logger.info(`Cleared UploadedFile (${meetingId})`);
    });
  }

  // clearing uploaded files for the whole server
  return UploadedFile.remove({}, () => {
    Logger.info('Cleared UploadedFile (all)');
  });
}
