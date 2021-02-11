import Breakouts from '/imports/api/breakouts';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import flat from 'flat';

export default function handleBreakoutRoomStarted({ body }, meetingId) {
  // 0 seconds default breakout time, forces use of real expiration time
  const DEFAULT_TIME_REMAINING = 0;

  const {
    parentMeetingId,
    breakout,
  } = body;

  const { breakoutId } = breakout;

  check(meetingId, String);

  const selector = {
    breakoutId,
  };

  const modifier = {
    $set: Object.assign(
      {
        users: [],
        joinedUsers: [],
      },
      { timeRemaining: DEFAULT_TIME_REMAINING },
      { parentMeetingId },
      flat(breakout),
    ),
  };

  try {
    const { numberAffected } = Breakouts.upsert(selector, modifier);

    if (numberAffected) {
      Logger.info('Updated timeRemaining and externalMeetingId '
        + `for breakout id=${breakoutId}`);
    }
  } catch (err) {
    Logger.error(`updating breakout: ${err}`);
  }
}
