import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Breakouts from '/imports/api/breakouts';

export default function handleBreakoutJoinURL({ body }) {
  const {
    redirectToHtml5JoinURL,
    userId,
    breakoutId,
  } = body;

  check(redirectToHtml5JoinURL, String);

  const selector = {
    breakoutId,
  };

  const modifier = {
    $push: {
      users: userId,
    },
    $set: {
      redirectToHtml5JoinURL,
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
