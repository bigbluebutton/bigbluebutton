import { check } from 'meteor/check';
import Users from '/imports/api/users';
import setApprovedStatus from '../modifiers/setApprovedStatus';
import userJoin from '../methods/userJoin';

export default function handleGuestsWaitingForApproval({ header, body }, meetingId) {
  const { userId } = header;
  const { status, approvedBy } = body;

  check(userId, String);
  check(meetingId, String);
  check(status, String);
  check(approvedBy, String);

  const selector = {
    meetingId,
    userId,
  };

  const User = Users.findOne(selector);

  const GUEST_STATUS_ALLOW = 'ALLOW';
  const approved = GUEST_STATUS_ALLOW === status;
  if (User && approved) {
    userJoin(meetingId, userId, User.authToken);
  }

  return setApprovedStatus(meetingId, userId, approved, approvedBy);
}
