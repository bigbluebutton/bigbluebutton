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
      users: {
        userId,
        redirectToHtml5JoinURL,
        insertedTime: new Date().getTime(),
      },
    },
  };

  try {
    const { insertedId, numberAffected } = Breakouts.upsert(selector, modifier);

    if (insertedId) {
      Logger.info(`Added breakout id=${breakoutId}`);
    } else if (numberAffected) {
      Logger.info(`Upserted breakout id=${breakoutId}`);
    }
  } catch (err) {
    Logger.error(`Adding breakout to collection: ${err}`);
  }
}
