import { check } from 'meteor/check';
import updateTimer from '/imports/api/timer/server/modifiers/updateTimer';

export default function handleTimerStarted({ body }, meetingId) {
  const { userId } = body;
  check(meetingId, String);
  check(userId, String);

  updateTimer({
    action: 'start',
    meetingId,
    requesterUserId: userId,
  });
}
