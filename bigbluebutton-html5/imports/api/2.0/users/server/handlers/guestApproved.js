import { check } from 'meteor/check';
import setApprovedStatus from '../modifiers/setApprovedStatus';

export default function handleGuestsWaitingForApproval({ header, body }, meetingId) {
  const { userId } = header;
  const { approved, approvedBy } = body;

  check(userId, String);
  check(meetingId, String);
  check(approved, Boolean);
  check(approvedBy, String);

  return setApprovedStatus(meetingId, userId, approved, approvedBy);
}
