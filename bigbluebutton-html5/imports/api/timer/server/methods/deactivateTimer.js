import { check } from 'meteor/check';
import updateTimer from '/imports/api/timer/server/modifiers/updateTimer';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function deactivateTimer() {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);
  check(meetingId, String);
  check(requesterUserId, String);

  updateTimer({ action: 'deactivate', meetingId, requesterUserId });
}
