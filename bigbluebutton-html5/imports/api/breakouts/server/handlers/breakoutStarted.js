import Breakouts from '/imports/api/breakouts';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import flat from 'flat';

export default function handleBreakoutRoomStarted({ body }, meetingId) {
  const DEFAULT_TIME_REMAINING = 15 * 60; // 15 minutes default breakout time

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
      { users: [] },
      { timeRemaining: DEFAULT_TIME_REMAINING },
      { parentMeetingId },
      flat(breakout),
    ),
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`updating breakout: ${err}`);
    }

    return Logger.info('Updated timeRemaining and externalMeetingId ' +
      `for breakout id=${breakoutId}`);
  };

  return Breakouts.upsert(selector, modifier, cb);
}
