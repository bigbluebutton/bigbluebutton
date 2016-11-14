import Breakouts from '/imports/api/breakouts';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function updateTimeRemaining({ payload }) {
  const {
    meetingId,
    timeRemaining,
  } = payload;

  check(meetingId, String);
  check(timeRemaining, Number);

  const selector = {
    parentMeetingId: payload.meetingId,
  };

  const modifier = {
    $set: {
      timeRemaining: payload.timeRemaining,
    },
  };

  Breakouts.update(selector, modifier, (err, numChanged) => console.log(err, numChanged));
}
