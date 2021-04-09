import { check } from 'meteor/check';
import updateConnectionStatus from '/imports/api/connection-status/server/modifiers/updateConnectionStatus';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function addConnectionStatus(level) {
  check(level, String);

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(meetingId, String);
  check(requesterUserId, String);

  updateConnectionStatus(meetingId, requesterUserId, level);
}
