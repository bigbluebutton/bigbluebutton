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

  const options = {
    multi: true,
  };

  console.log('found', Breakouts.find(selector).fetch().length);
  return Breakouts.update(selector, modifier, options, (err, num) => console.log('updated', err, num));
}
