import { check } from 'meteor/check';
import updateTimer from '/imports/api/timer/server/modifiers/updateTimer';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function switchTimer(stopwatch) {
  check(stopwatch, Boolean);

  const { meetingId } = extractCredentials(this.userId);
  check(meetingId, String);

  // Bogus value of time. It won't update the collection
  const time = 0;

  updateTimer('switch', meetingId, time, stopwatch);
}
