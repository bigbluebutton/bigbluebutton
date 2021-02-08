import Note from '/imports/api/note';
import Logger from '/imports/startup/server/logger';

export default function clearNote(meetingId) {
  if (meetingId) {
    try {
      const numberAffected = Note.remove({ meetingId });

      if (numberAffected) {
        Logger.info(`Cleared Note (${meetingId})`);
      }
    } catch (err) {
      Logger.error(`Error on clearing Note (${meetingId}). ${err}`);
    }
  } else {
    try {
      const numberAffected = Note.remove({});

      if (numberAffected) {
        Logger.info('Cleared Note (all)');
      }
    } catch (err) {
      Logger.error(`Error on clearing Note (all). ${err}`);
    }
  }
}
