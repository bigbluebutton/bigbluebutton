import Breakouts from '/imports/api/breakouts';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function({ payload }) {
  const breakoutMeetingId = payload.breakoutMeetingId;

  check(breakoutMeetingId, String);

  const selector = {
    breakoutMeetingId: payload.breakoutMeetingId,
  };
  const modifier = payload;

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
}
