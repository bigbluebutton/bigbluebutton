import Breakouts from '/imports/api/breakouts';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function userBreakoutChanged({ body }) {
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
    const numberAffectedOld = Breakouts.update(oldBreakoutSelector, oldModifier);
    const numberAffectedNew = Breakouts.update(newBreakoutSelector, newModifier);

    if (numberAffectedOld && numberAffectedNew) {
      Logger.info(`Updated user breakout for userId=${userId}`);
    }
  } catch (err) {
    Logger.error(`Updating user breakout: ${err}`);
  }
}
