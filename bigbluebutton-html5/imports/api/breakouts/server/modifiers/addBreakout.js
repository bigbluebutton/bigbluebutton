import Breakouts from '/imports/api/breakouts';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function addBreakout(payload) {
  const {
    breakoutMeetingId,
    parentMeetingId,
    name,
  } = payload;

  check(breakoutMeetingId, String);
  check(parentMeetingId, String);
  check(name, String);

  const selector = {
    breakoutMeetingId: payload.breakoutMeetingId,
  };

  const modifier = {
    $set: {
      breakoutMeetingId,
      parentMeetingId,
      name,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding breakout to collection: ${err}`);
    }

    const {
      insertedId,
    } = numChanged;
    if (insertedId) {
      return Logger.info(`Added breakout id=${payload.breakoutMeetingId}`);
    }

    return Logger.info(`Upserted breakout id=${payload.breakoutMeetingId}`);
  };

  Breakouts.upsert(selector, modifier, cb);
};
