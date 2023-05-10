import { check } from 'meteor/check';
import Timer from '/imports/api/timer';
import updateTimer from '/imports/api/timer/server/modifiers/updateTimer';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function startTimer(time) {
  check(time, Number);

  const { meetingId } = extractCredentials(this.userId);
  check(meetingId, String);

  const timer = Timer.findOne(
    { meetingId },
    { fields: { time: 1 } },
  );

  if (timer) {
    if (time !== timer.time) {
      updateTimer('start', meetingId, time);
    } else {
      updateTimer('resume', meetingId);
    }
  } else {
    Logger.warn(`Could not start timer for meetingId=${meetingId}`);
  }
}
