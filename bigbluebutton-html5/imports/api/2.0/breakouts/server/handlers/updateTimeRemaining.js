import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Breakouts from './../../';

export default function handleUpdateTimeRemaining({ body }) {
  const {
    meetingId,
    timeRemaining,
  } = body;

  check(meetingId, String);
  check(timeRemaining, Number);

  const selector = {
    parentMeetingId: meetingId,
  };

  const modifier = {
    $set: {
      timeRemaining,
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
      return Logger.info('Updated breakout time remaining for breakouts ' +
                         `where parentMeetingId=${meetingId}`);
    }
  };

  return Breakouts.update(selector, modifier, options, cb);
}
