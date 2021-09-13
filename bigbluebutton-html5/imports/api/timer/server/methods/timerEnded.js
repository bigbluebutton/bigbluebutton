import { check } from 'meteor/check';
import updateTimer from '/imports/api/timer/server/modifiers/updateTimer';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function timerEnded() {
  const { meetingId } = extractCredentials(this.userId);
  check(meetingId, String);

  updateTimer('ended', meetingId);
}
