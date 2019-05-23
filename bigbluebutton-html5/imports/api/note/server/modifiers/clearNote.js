import Note from '/imports/api/note';
import Logger from '/imports/startup/server/logger';

export default function clearNote(meetingId) {
  if (meetingId) {
    return Note.remove({ meetingId }, () => {
      Logger.info(`Cleared Note (${meetingId})`);
    });
  }

  return Note.remove({}, () => {
    Logger.info('Cleared Note (all)');
  });
}
