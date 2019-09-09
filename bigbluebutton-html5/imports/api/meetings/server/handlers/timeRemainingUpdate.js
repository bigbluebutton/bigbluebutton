import { check } from 'meteor/check';
import { MeetingTimeRemaing } from '/imports/api/meetings';
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
      timeRemaining: timeLeftInSec,
    },
  };

  const cb = (err) => {
    if (err) {
      Logger.error(`Changing recording time: ${err}`);
    }
  };

  return MeetingTimeRemaing.upsert(selector, modifier, cb);
}
