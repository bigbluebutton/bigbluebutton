import Note from '/imports/api/note';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function updateNote(noteId, revs) {
  check(noteId, String);
  check(revs, Number);

  const selector = {
    noteId,
  };

  const modifier = {
    $set: {
      revs,
    },
  };

  try {
    const numberAffected = Note.update(selector, modifier, { multi: true });

    if (numberAffected) {
      Logger.verbose('Notes: update note pad', { pad: noteId, revs });
    }
  } catch (err) {
    Logger.error('Notes: error when updating note pad', { err });
  }
}
