import Breakouts from '/imports/api/breakouts';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default async function userBreakoutChanged({ body }) {
  check(body, Object);

  const {
    meetingId,
    userId,
    fromBreakoutId,
    toBreakoutId,
    redirectToHtml5JoinURL,
  } = body;

  check(meetingId, String);
  check(userId, String);
  check(fromBreakoutId, String);
  check(toBreakoutId, String);
  check(redirectToHtml5JoinURL, String);

  const oldBreakoutSelector = {
    parentMeetingId: meetingId,
    breakoutId: fromBreakoutId,
    freeJoin: false,
  };

  const newBreakoutSelector = {
    parentMeetingId: meetingId,
    breakoutId: toBreakoutId,
  };

  const oldModifier = {
    $unset: {
      [`url_${userId}`]: '',
    },
  };

  const newModifier = {
    $set: {
      [`url_${userId}`]: {
        redirectToHtml5JoinURL,
        insertedTime: new Date().getTime(),
      },
    },
  };

  try {
    let numberAffectedRows = 0;

    if (oldBreakoutSelector.breakoutId !== '') {
      numberAffectedRows += await Breakouts.updateAsync(oldBreakoutSelector, oldModifier);
    }

    if (newBreakoutSelector.breakoutId !== '') {
      numberAffectedRows += await Breakouts.updateAsync(newBreakoutSelector, newModifier);
    }

    if (numberAffectedRows > 0) {
      Logger.info(`Updated user breakout for userId=${userId}`);
    }
  } catch (err) {
    Logger.error(`Updating user breakout: ${err}`);
  }
}
