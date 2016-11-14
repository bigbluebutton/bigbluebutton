import Breakouts from '/imports/api/breakouts';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function ({ payload }) {
  const meetingId = payload.meetingId;

  check(meetingId, String);

  const selector = {
    breakoutMeetingId: payload.meetingId,
  };

  modifier = {
    $set: {
      users: [],
      timeRemaining: Number(payload.timeRemaining),
      externalMeetingId: payload.externalMeetingId,
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
      return Logger.info(`Added breakout id=${payload.meetingId}`);
    }

    return Logger.info(`Upserted breakout id=${payload.meetingId}`);
  };

  Breakouts.upsert(selector, modifier, cb);
}
