import { check } from 'meteor/check';
import Timer from '/imports/api/timer';
import Logger from '/imports/startup/server/logger';
import { getInitialState } from '/imports/api/timer/server/helpers';

// This method should only be used by the server
export default function addTimer(meetingId) {
  check(meetingId, String);

  const selector = {
    meetingId,
  };

  const modifier = {
    meetingId,
    ...getInitialState(),
    active: false,
    ended: 0,
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding timer to the collection: ${err}`);
    }

    if (numChanged) {
      return Logger.debug(`Added timer meeting=${meetingId}`);
    }

    return Logger.debug(`Upserted timer meeting=${meetingId}`);
  };

  return Timer.upsert(selector, modifier, cb);
}
