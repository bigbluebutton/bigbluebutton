import { check } from 'meteor/check';
import updateTimer from '/imports/api/timer/server/modifiers/updateTimer';

export default function handleTimerSwitched({ body }, meetingId) {
  const { userId, stopwatch } = body;

  check(meetingId, String);
  check(userId, String);
  check(stopwatch, Boolean);

  updateTimer({
    action: 'switch',
    meetingId,
    requesterUserId: userId,
    stopwatch,
  });
}
