import { check } from 'meteor/check';
import updateTimer from '/imports/api/timer/server/modifiers/updateTimer';

export default function handleTimerDeactivated({ body }, meetingId) {
  const { userId } = body;
  check(meetingId, String);
  check(userId, String);

  updateTimer({
    action: 'deactivate',
    meetingId,
    requesterUserId: userId,
  });
}
