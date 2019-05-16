import Captions from '/imports/api/captions';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function padUpdate(padId, data, revs) {
  check(padId, String);
  check(data, String);
  check(revs, Number);

  const selector = {
    padId,
  };

  const modifier = {
    $set: {
      data,
      revs,
    },
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Updating captions pad: ${err}`);
    }

    return Logger.verbose(`Update captions pad=${padId} revs=${revs}`);
  };

  return Captions.update(selector, modifier, { multi: true }, cb);
}
