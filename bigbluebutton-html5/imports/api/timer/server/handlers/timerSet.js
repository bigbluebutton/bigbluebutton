import { check } from 'meteor/check';
import updateTimer from '/imports/api/timer/server/modifiers/updateTimer';

export default function handleTimerSet({ body }, meetingId) {
  const { userId, time } = body;
  
  check(meetingId, String);
  check(userId, String);
  check(time, Number);

  updateTimer({
    action: 'set',
    meetingId,
    requesterUserId: userId,
    time,
  });
}
