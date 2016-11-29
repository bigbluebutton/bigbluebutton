import Breakouts from '/imports/api/breakouts';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function handleUpdateTimeRemaining({ payload }) {
  const {
    meetingId,
    timeRemaining,
  } = payload;

  check(meetingId, String);
  check(timeRemaining, Number);

  const selector = {
    parentMeetingId: meetingId,
  };

  const modifier = {
    $set: {
      timeRemaining: timeRemaining,
    },
  };

  const options = {
    multi: true,
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Updating breakouts: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Updated breakout time remaining for breakouts ` +
                         `where parentMeetingId=${meetingId}`);
    }
  };

  return Breakouts.update(selector, modifier, options, cb);
}
