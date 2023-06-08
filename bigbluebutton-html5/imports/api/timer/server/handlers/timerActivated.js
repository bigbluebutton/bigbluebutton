import { check } from 'meteor/check';
import updateTimer from '/imports/api/timer/server/modifiers/updateTimer';

export default function handleTimerActivated({ body }, meetingId) {
  const { userId } = body;
  check(meetingId, String);
  check(userId, String);

  updateTimer({
    action: 'activate',
    meetingId,
    requesterUserId: userId,
  });
}
