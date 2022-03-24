import Breakouts from '/imports/api/breakouts';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function userBreakoutChanged({ body }) {
  check(body, Object);

  const {
    parentId,
    userId,
    fromBreakoutId,
    toBreakoutId,
    redirectToHtml5JoinUrl,
  } = body;

  check(parentId, String);
  check(userId, String);
  check(fromBreakoutId, String);
  check(toBreakoutId, String);
  check(redirectToHtml5JoinUrl, String);

  const oldBreakoutSelector = {
    parentMeetingId: parentId,
    breakoutId: fromBreakoutId,
  };

  const newBreakoutSelector = {
    parentMeetingId: parentId,
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
        redirectToHtml5JoinUrl,
        insertedTime: new Date().getTime(),
      },
    },
  };

  try {
    const numberAffectedOld = Breakouts.update(oldBreakoutSelector, oldModifier);
    const numberAffectedNew = Breakouts.update(newBreakoutSelector, newModifier);

    if (numberAffectedOld && numberAffectedNew) {
      Logger.info(`Updated user breakout for userId=${userId}`);
    }
  } catch (err) {
    Logger.error(`Updating user breakout: ${err}`);
  }
}
