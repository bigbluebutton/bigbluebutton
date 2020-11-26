import Captions from '/imports/api/captions';
import Logger from '/imports/startup/server/logger';
import editCaptions from '/imports/api/captions/server/methods/editCaptions';
import { check } from 'meteor/check';

export default function updatePad(padId, data, revs) {
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
    $inc: {
      length: data.length,
    },
  };

  try {
    const numberAffected = Captions.update(selector, modifier, { multi: true });

    if (numberAffected) {
      editCaptions(padId, data, revs);
      Logger.verbose('Captions: updated pad', { padId, revs });
    }
  } catch (err) {
    Logger.error(`Updating captions pad: ${err}`);
  }
}
