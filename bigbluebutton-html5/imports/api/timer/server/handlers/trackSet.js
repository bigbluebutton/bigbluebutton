import { check } from 'meteor/check';
import updateTimer from '/imports/api/timer/server/modifiers/updateTimer';

export default function handleTrackSet({ body }, meetingId) {
  const { userId, track } = body;

  check(meetingId, String);
  check(userId, String);
  check(track, String);

  updateTimer({
    action: 'track',
    meetingId,
    requesterUserId: userId,
    stopwatch: false,
    track,
  });
}
