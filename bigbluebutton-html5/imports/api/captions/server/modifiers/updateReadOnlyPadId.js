import Captions from '/imports/api/captions';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function updateReadOnlyPadId(padId, readOnlyPadId) {
  check(padId, String);
  check(readOnlyPadId, String);

  const selector = {
    padId,
  };

  const modifier = {
    $set: {
      readOnlyPadId,
    },
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Adding readOnlyPadId captions pad: ${err}`);
    }

    return Logger.verbose(`Added readOnlyPadId captions pad=${padId} readOnlyPadId=${readOnlyPadId}`);
  };

  return Captions.update(selector, modifier, { multi: true }, cb);
}
