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
    $set: {
      [`url_${userId}`]: {
        redirectToHtml5JoinURL,
        insertedTime: new Date().getTime(),
      },
    },
  };

  try {
    const ATTEMPT_EVERY_MS = 1000;

    let numberAffected = 0;

    const updateBreakout = Meteor.bindEnvironment(() => {
      numberAffected = Breakouts.update(selector, modifier);
    });

    const updateBreakoutPromise = new Promise((resolve) => {
      const updateBreakoutInterval = setInterval(() => {
        updateBreakout();

        if (numberAffected) {
          resolve(clearInterval(updateBreakoutInterval));
        }
      }, ATTEMPT_EVERY_MS);
    });

    updateBreakoutPromise.then(() => {
      Logger.info(`Upserted breakout id=${breakoutId}`);
    });
  } catch (err) {
    Logger.error(`Adding breakout to collection: ${err}`);
  }
}
