import Breakouts from '/imports/api/breakouts';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function handleBreakoutRoomStarted({ payload }) {
  const {
    meetingId,
    timeRemaining,
    externalMeetingId,
  } = payload;

  check(meetingId, String);

  const selector = {
    breakoutMeetingId: meetingId,
  };

  modifier = {
    $set: {
      users: [],
      timeRemaining: Number(timeRemaining),
      externalMeetingId: externalMeetingId,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`updating breakout: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Updated timeRemaining and externalMeetingId ` +
                         `for breakout id=${meetingId}`);
    }
  };

  return Breakouts.update(selector, modifier, cb);
}
