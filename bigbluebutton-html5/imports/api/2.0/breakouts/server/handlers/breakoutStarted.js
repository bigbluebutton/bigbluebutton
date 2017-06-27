import Breakouts from '/imports/api/1.1/breakouts';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function handleBreakoutRoomStarted({ body }) {
  const {
    meetingId,
    externalMeetingId,
  } = body.breakout;

  const timeRemaining = 15;

  check(meetingId, String);

  const selector = {
    breakoutMeetingId: meetingId,
  };

  const modifier = {
    $set: {
      users: [],
      timeRemaining: Number(timeRemaining),
      externalMeetingId,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`updating breakout: ${err}`);
    }

    if (numChanged) {
      return Logger.info('Updated timeRemaining and externalMeetingId ' +
                         `for breakout id=${meetingId}`);
    }
  };

  return Breakouts.update(selector, modifier, cb);
}
