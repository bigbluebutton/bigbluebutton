import { check } from 'meteor/check';
import updateTimer from '/imports/api/timer/server/modifiers/updateTimer';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function setTimer(time) {
  check(time, Number);

  const { meetingId } = extractCredentials(this.userId);
  check(meetingId, String);

  updateTimer('set', meetingId, time);
}
