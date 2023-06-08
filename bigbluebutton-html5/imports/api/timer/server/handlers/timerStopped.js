import { check } from 'meteor/check';
import updateTimer from '/imports/api/timer/server/modifiers/updateTimer';

export default function handleTimerStopped({ body }, meetingId) {
  const { userId, accumulated } = body;

  check(meetingId, String);
  check(userId, String);
  check(accumulated, Number);

  updateTimer({
    action: 'stop',
    meetingId,
    requesterUserId: userId,
    accumulated,
  });
}
