import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Breakouts from '/imports/api/2.0/breakouts';
import flat from 'flat';

export default function addBreakout(breakout) {
  const {
    breakoutMeetingId,
    parentId,
    name,
  } = breakout;

  check(breakoutMeetingId, String);
  check(parentId, String);
  check(name, String);

  const selector = { breakoutMeetingId };

  const modifier = {
    $set:
    flat(breakout, { safe: true })
    ,
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding breakout to collection: ${err}`);
    }

    const {
      insertedId,
    } = numChanged;
    if (insertedId) {
      return Logger.info(`Added breakout id=${breakoutMeetingId}`);
    }

    return Logger.info(`Upserted breakout id=${breakoutMeetingId}`);
  };

  return Breakouts.upsert(selector, modifier, cb);
}
