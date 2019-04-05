import { check } from 'meteor/check';
import setGuestStatus from '../modifiers/setGuestStatus';

export default function handleGuestApproved({ header, body }, meetingId) {
  const { userId } = header;
  check(userId, String);
  if (userId !== 'nodeJSapp') { return false; }

  const { approvedBy, guests } = body;
  check(meetingId, String);
  check(approvedBy, String);
  check(guests, Array);

  return guests.forEach(guest => setGuestStatus(meetingId, guest.guest, guest.status, approvedBy));
}
