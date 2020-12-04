import { check } from 'meteor/check';
import { MeetingTimeRemaining } from '/imports/api/meetings';
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

  try {
    MeetingTimeRemaining.upsert(selector, modifier);
  } catch (err) {
    Logger.error(`Changing recording time: ${err}`);
  }
}
