import { check } from 'meteor/check';
import updateTimer from '/imports/api/timer/server/modifiers/updateTimer';

export default function handleTimerEnded({ body }, meetingId) {
  check(meetingId, String);
  check(body, Object);

  updateTimer({
    action: 'reset',
    meetingId,
    requesterUserId: 'nodeJSapp',
  });
}
