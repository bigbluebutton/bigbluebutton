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

  const cb = (err) => {
    if (err) {
      return Logger.error('Notes: error when updating note pad', { err });
    }

    return Logger.verbose('Notes: update note pad', { pad: noteId, revs });
  };

  return Note.update(selector, modifier, { multi: true }, cb);
}
