import Upload from '/imports/api/upload';
import Logger from '/imports/startup/server/logger';

export default function clearUpload(meetingId) {
  if (meetingId) {
    return Upload.remove({ meetingId }, () => {
      Logger.info(`Cleared Upload (${meetingId})`);
    });
  }

  // clearing upload for the whole server
  return Uploa.remove({}, () => {
    Logger.info('Cleared Upload (all)');
  });
}
