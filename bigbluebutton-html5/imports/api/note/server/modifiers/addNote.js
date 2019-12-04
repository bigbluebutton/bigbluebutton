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

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding note to the collection: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Added note id=${noteId} readOnlyId=${readOnlyNoteId} meeting=${meetingId}`);
    }

    return Logger.info(`Upserted note id=${noteId} readOnlyId=${readOnlyNoteId} meeting=${meetingId}`);
  };

  return Note.upsert(selector, modifier, cb);
}
