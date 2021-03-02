import { check } from 'meteor/check';
import Note from '/imports/api/note';
import Logger from '/imports/startup/server/logger';

export default function addNote(meetingId, noteId, readOnlyNoteId) {
  check(meetingId, String);
  check(noteId, String);
  check(readOnlyNoteId, String);

  const selector = {
    meetingId,
    noteId,
  };

  const modifier = {
    meetingId,
    noteId,
    readOnlyNoteId,
    revs: 0,
  };

  try {
    const { insertedId } = Note.upsert(selector, modifier);

    if (insertedId) {
      Logger.info(`Added note id=${noteId} readOnlyId=${readOnlyNoteId} meeting=${meetingId}`);
    } else {
      Logger.info(`Upserted note id=${noteId} readOnlyId=${readOnlyNoteId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Adding note to the collection: ${err}`);
  }
}
