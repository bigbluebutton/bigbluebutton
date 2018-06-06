import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Breakouts from '/imports/api/breakouts';

export default function handleBreakoutJoinURL({ body }) {
  const {
    noRedirectJoinURL,
    userId,
    breakoutId,
  } = body;

  check(noRedirectJoinURL, String);

  const selector = {
    breakoutId,
  };

  const modifier = {
    $push: {
      users: userId,
    },
    $set: {
      noRedirectJoinURL,
    },
  };

  const cb = (cbErr, numChanged) => {
    if (cbErr) {
      return Logger.error(`Adding breakout to collection: ${cbErr}`);
    }

    const {
      insertedId,
    } = numChanged;
    if (insertedId) {
      return Logger.info(`Added breakout id=${breakoutId}`);
    }

    return Logger.info(`Upserted breakout id=${breakoutId}`);
  };

  return Breakouts.upsert(selector, modifier, cb);
}
