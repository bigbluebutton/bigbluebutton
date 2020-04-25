import { check } from 'meteor/check';
import Timer from '/imports/api/timer';
import Logger from '/imports/startup/server/logger';
import { getDefaultTime } from '/imports/api/timer/server/helpers';

// This method should only be used by the server
export default function addTimer(meetingId) {
  check(meetingId, String);

  const selector = {
    meetingId,
  };

  const time = getDefaultTime();
  check(time, Number);

  const modifier = {
    meetingId,
    stopwatch: true,
    active: false,
    running: false,
    time,
    accumulated: 0,
    timestamp: 0,
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding timer to the collection: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Added timer meeting=${meetingId}`);
    }

    return Logger.info(`Upserted timer meeting=${meetingId}`);
  };

  return Timer.upsert(selector, modifier, cb);
}
