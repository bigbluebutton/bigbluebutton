import { check } from 'meteor/check';
import Users from '/imports/api/users';
import setApprovedStatus from '../modifiers/setApprovedStatus';
import userJoin from '../methods/userJoin';

export default function handleGuestsWaitingForApproval({ header, body }, meetingId) {
  const { userId } = header;
  const { guests, approvedBy } = body;

  check(userId, String);
  check(meetingId, String);
  check(approvedBy, String);

  return guests.forEach(item => {
    const { guest, approved } = item;

    check(approved, Boolean);
    check(guest, String);

    const selector = {
      meetingId,
      userId: guest,
      clientType: "HTML5",
    };

    const User = Users.findOne(selector);

    if (User && approved) {
      userJoin(meetingId, guest, User.authToken);
    }

    setApprovedStatus(meetingId, guest, approved, approvedBy);
  })
}
