import Captions from '/imports/api/captions';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function addReadOnlyPadId(padId, readOnlyNoteId) {
  check(padId, String);
  check(readOnlyNoteId, String);

  const selector = {
    padId,
  };

  const modifier = {
    $set: {
      readOnlyPadId: readOnlyNoteId,
    },
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Adding readOnlyPadId captions pad: ${err}`);
    }

    return Logger.verbose(`Added readOnlyPadId captions pad=${padId} readOnlyNoteId=${readOnlyNoteId}`);
  };

  return Captions.update(selector, modifier, { multi: true }, cb);
}
