import { check } from 'meteor/check';
import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';

export default function handleTimeRemainingUpdate({ body }, meetingId) {
  check(meetingId, String);

  check(body, {
    timeLeftInSec: Number,
  });
  const { timeLeftInSec } = body;

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: {
      'durationProps.timeRemaining': timeLeftInSec,
    },
  };

  const cb = (err) => {
    if (err) {
      Logger.error(`Changing recording time: ${err}`);
    }
  };

  return Meetings.upsert(selector, modifier, cb);
}
